/**
 * Procedural wind for the acoustic demo: looped noise shaped by drifting filters, with
 * slow, unrelated gust cycles, so nothing downloads until a visitor turns the sound on.
 * With the window open the wind comes straight in; closed, it is low-passed and much
 * quieter — roughly what an insulated uPVC window does to outside noise.
 */

const NOISE_SECONDS = 6;
/**
 * Playback level, measured offline: an open window plays at about -22 dBFS RMS with peaks
 * under 0.5; closed sits about 18 dB lower and much darker.
 */
const VOLUME = 0.7;

/** Noise that loops without a click: the tail is crossfaded into the start. */
function loopableNoise(ctx: BaseAudioContext, kind: "white" | "brown") {
  const length = Math.floor(ctx.sampleRate * NOISE_SECONDS);
  const fade = Math.floor(ctx.sampleRate * 0.5);
  const raw = new Float32Array(length + fade);
  let last = 0;
  for (let i = 0; i < raw.length; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === "white") {
      raw[i] = white;
    } else {
      last = (last + 0.02 * white) / 1.02;
      raw[i] = last * 3.5;
    }
  }
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    // Equal-power crossfade keeps the level steady across the loop point.
    data[i] = i < fade ? raw[i] * Math.sqrt(i / fade) + raw[length + i] * Math.sqrt(1 - i / fade) : raw[i];
  }
  return buffer;
}

export type WindGraph = {
  /** What reaches the room. */
  output: AudioNode;
  /** The wind outside, before the window. */
  outside: AnalyserNode;
  /** The wind after the window. */
  inside: AnalyserNode;
  setOpen: (open: boolean, smooth?: boolean) => void;
  stop: () => void;
};

/** Builds the wind on any audio context (an OfflineAudioContext works for measuring). */
export function buildWind(ctx: BaseAudioContext, open: boolean): WindGraph {
  const t0 = ctx.currentTime;
  const white = loopableNoise(ctx, "white");
  const brown = loopableNoise(ctx, "brown");
  const scheduled: AudioScheduledSourceNode[] = [];

  const play = (buffer: AudioBuffer) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start(t0, Math.random() * NOISE_SECONDS);
    scheduled.push(source);
    return source;
  };
  const lfo = (frequency: number, depth: number, param: AudioParam) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = frequency;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    osc.connect(amount).connect(param);
    osc.start(t0);
    scheduled.push(osc);
  };
  const filter = (type: BiquadFilterType, frequency: number, q: number) => {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = q;
    return f;
  };
  const gain = (value: number) => {
    const g = ctx.createGain();
    g.gain.value = value;
    return g;
  };

  // The body of the wind drifts through the low mids; a narrow band above it whistles;
  // brown noise underneath gives the rumble. Everything swells and settles together.
  const body = filter("bandpass", 520, 0.9);
  const whistle = filter("bandpass", 1300, 4);
  const rumble = filter("lowpass", 260, 0.7);
  const gust = gain(0.62);
  play(white).connect(body).connect(gust);
  play(white).connect(whistle).connect(gain(0.35)).connect(gust);
  play(brown).connect(rumble).connect(gain(0.5)).connect(gust);

  lfo(0.11, 260, body.frequency);
  lfo(0.043, 140, body.frequency);
  lfo(0.07, 500, whistle.frequency);
  lfo(0.09, 0.22, gust.gain);
  lfo(0.031, 0.16, gust.gain);

  const outside = ctx.createAnalyser();
  outside.fftSize = 1024;
  gust.connect(outside);

  // The window itself.
  const muffle = filter("lowpass", 9000, 0.5);
  const level = gain(1);
  const inside = ctx.createAnalyser();
  inside.fftSize = 1024;
  gust.connect(muffle).connect(level).connect(inside);

  // Closed keeps a soft, dull wind rather than silence (phone speakers drop most sound
  // below ~300 Hz, so a lower cutoff would just sound like the audio stopped).
  const setOpen = (isOpen: boolean, smooth = true) => {
    const frequency = isOpen ? 9000 : 480;
    const volume = isOpen ? 0.9 : 0.16;
    if (smooth) {
      muffle.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.18);
      level.gain.setTargetAtTime(volume, ctx.currentTime, 0.18);
    } else {
      muffle.frequency.value = frequency;
      level.gain.value = volume;
    }
  };
  setOpen(open, false);

  return { output: level, outside, inside, setOpen, stop: () => scheduled.forEach((node) => node.stop()) };
}

export type Wind = {
  setOpen: (open: boolean) => void;
  /** RMS levels, for drawing the bars. */
  read: () => { outside: number; inside: number };
  /** Fades out, then releases the audio device. */
  stop: () => void;
};

/** Call from a click or tap: browsers only allow sound that starts from a user gesture. */
export function startWind(open: boolean): Wind | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  void ctx.resume();

  const graph = buildWind(ctx, open);
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.3);
  graph.output.connect(master).connect(ctx.destination);

  const samples = new Float32Array(graph.outside.fftSize);
  const rms = (analyser: AnalyserNode) => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const v of samples) sum += v * v;
    return Math.sqrt(sum / samples.length);
  };

  let stopped = false;
  return {
    setOpen: (isOpen) => graph.setOpen(isOpen),
    read: () => ({ outside: rms(graph.outside), inside: rms(graph.inside) }),
    stop: () => {
      if (stopped) return;
      stopped = true;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      window.setTimeout(() => {
        graph.stop();
        void ctx.close();
      }, 700);
    },
  };
}
