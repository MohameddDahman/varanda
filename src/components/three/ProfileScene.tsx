"use client";

/* eslint-disable react-hooks/immutability --
   Three.js materials and easing state are mutated inside useFrame every
   frame; that is how React Three Fiber animates without re-rendering. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Shared, mutable scroll state written by the DOM and read every frame. */
export type ProfileState = { step: number; progress: number };

type Pt = [number, number];
type Rect = [number, number, number, number]; // x1, y1, x2, y2 (mm)

const S = 0.01; // mm → world units
const CX = 35; // section centre (mm)
const CY = 86;
const LENGTH = 1.15; // a short slice, like a sample cut from a real profile

const X = (x: number) => (x - CX) * S;
const Y = (y: number) => (y - CY) * S;

const poly = (pts: Pt[]) => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(X(x), Y(y)) : s.moveTo(X(x), Y(y))));
  s.closePath();
  return s;
};

const rectPath = ([x1, y1, x2, y2]: Rect) => {
  const p = new THREE.Path();
  p.moveTo(X(x1), Y(y1));
  p.lineTo(X(x1), Y(y2));
  p.lineTo(X(x2), Y(y2));
  p.lineTo(X(x2), Y(y1));
  p.closePath();
  return p;
};

const circlePath = (x: number, y: number, r: number) => {
  const p = new THREE.Path();
  p.absarc(X(x), Y(y), r * S, 0, Math.PI * 2, true);
  return p;
};

const rectShape = (r: Rect) => poly([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]]);

/** U-channel steel reinforcement sitting inside a chamber. */
const channel = ([x1, y1, x2, y2]: Rect, t = 1.6) =>
  poly([
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x2 - t, y2],
    [x2 - t, y1 + t],
    [x1 + t, y1 + t],
    [x1 + t, y2],
    [x1, y2],
  ]);

/** A bulb gasket: a foot that sits in its groove and a rounded sealing lip. */
const bulbGasket = (x: number, y: number, w: number, h: number) => {
  const s = new THREE.Shape();
  s.moveTo(X(x), Y(y));
  s.lineTo(X(x + w), Y(y));
  s.lineTo(X(x + w), Y(y + h * 0.35));
  s.absellipse(X(x + w / 2), Y(y + h * 0.62), (w / 2) * S, h * 0.38 * S, 0, Math.PI, false);
  s.lineTo(X(x), Y(y));
  return s;
};

function useGeometry(shape: THREE.Shape, depth = LENGTH, bevel = true) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 2,
      curveSegments: 10,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  }, [shape, depth, bevel]);
}

function Part({
  shape,
  material,
  depth,
  bevel,
  partRef,
}: {
  shape: THREE.Shape;
  material: THREE.Material;
  depth?: number;
  bevel?: boolean;
  partRef?: React.Ref<THREE.Mesh>;
}) {
  const geometry = useGeometry(shape, depth, bevel);
  return <mesh ref={partRef} geometry={geometry} material={material} castShadow receiveShadow />;
}

/** Real-world section of a 70 mm, 7-chamber uPVC casement: frame, sash, bead, steel, seals and an insulated glass unit. */
function useShapes() {
  return useMemo(() => {
    // Frame: exterior lip on the left, interior stop on the right.
    const frame = poly([
      [0, 0],
      [70, 0],
      [70, 56],
      [62, 56],
      [62, 48],
      [6, 48],
      [6, 60],
      [0, 60],
    ]);
    frame.holes.push(
      // Seven chambers: two stacked on each outer side, a narrow insulating one, the main steel chamber and an inner one.
      rectPath([2.5, 2.5, 11, 22.5]),
      rectPath([2.5, 24.5, 11, 45.5]),
      rectPath([13, 2.5, 19, 45.5]),
      rectPath([21, 2.5, 49, 45.5]),
      rectPath([51, 2.5, 57, 45.5]),
      rectPath([59, 2.5, 67.5, 22.5]),
      rectPath([59, 24.5, 67.5, 45.5]),
    );

    // Sash: a hardware (euro) groove on the room side, an exterior upstand holding the outer gasket.
    const sash = poly([
      [9, 50],
      [60, 50],
      [60, 61],
      [58, 61],
      [58, 59.5],
      [56, 59.5],
      [56, 75.5],
      [58, 75.5],
      [58, 74],
      [60, 74],
      [60, 92],
      [17, 92],
      [17, 112],
      [9, 112],
    ]);
    sash.holes.push(
      rectPath([11.5, 52.5, 20, 70]),
      rectPath([11.5, 72, 20, 89.5]),
      rectPath([22, 52.5, 32, 89.5]),
      rectPath([34, 52.5, 54, 89.5]),
      rectPath([11.4, 95, 14.6, 108]),
    );

    // Glazing bead with its own chamber and a screw-port boss.
    const bead = poly([
      [43, 92],
      [56, 92],
      [56, 103],
      [47, 108],
      [43, 108],
    ]);
    bead.holes.push(rectPath([45.5, 94.5, 53.5, 100.5]), circlePath(49.5, 103.2, 1.1));

    // Insulated glass unit: two panes, a hollow aluminium spacer filled with desiccant,
    // butyl strips against each pane and a secondary seal along the edge.
    const spacer = rectShape([23.4, 95, 36.6, 101]);
    spacer.holes.push(rectPath([24.6, 96.2, 35.4, 99.8]));

    return {
      frame,
      sash,
      bead,
      // Espagnolette drive rod running inside the sash's hardware groove.
      rod: rectShape([56.4, 60.4, 57.8, 74.6]),
      steelFrame: channel([22.6, 4.1, 47.4, 43.9]),
      steelSash: channel([35.4, 54, 52.6, 88]),
      paneOut: rectShape([18.4, 94, 22.6, 172]),
      paneIn: rectShape([37.4, 94, 41.6, 172]),
      spacer,
      desiccant: rectShape([24.6, 96.2, 35.4, 99.8]),
      butyl: [rectShape([22.6, 95, 23.4, 101]), rectShape([36.6, 95, 37.4, 101])],
      edgeSeal: rectShape([22.6, 93.4, 37.4, 95]),
      settingBlock: rectShape([18, 92, 42, 93.4]),
      gaskets: [
        // Glass gaskets: outer (in the upstand) and inner (in the bead).
        bulbGasket(17, 104, 1.4, 7),
        bulbGasket(41.6, 99, 1.4, 7),
        // Double seal between sash and frame.
        rectShape([12, 48, 15.5, 50]),
        rectShape([52, 48, 55.5, 50]),
        // Weather seals at the frame lips.
        rectShape([6, 53, 9, 58]),
        rectShape([60, 50, 62.2, 54]),
      ],
    };
  }, []);
}

const WHITE = new THREE.Color("#f1f2f0");
const STEEL = new THREE.Color("#9aa3ad");
const BLACK = new THREE.Color("#121316");
const GLASS = new THREE.Color("#cfe6df");
const RED = new THREE.Color("#d71920");
const DEEP_RED = new THREE.Color("#5a0408");
const METAL = new THREE.Color("#b9c0c8");

// Locking points along the slice (world z), and screws fixing the steel.
const CAMS = [-0.32, 0.22];
const SCREWS = [-0.42, 0, 0.42];

/** Espagnolette cams on the sash and their keepers on the frame. */
function LockHardware({ material, cams }: { material: THREE.Material; cams: React.Ref<THREE.Group> }) {
  const camGeo = useMemo(() => new THREE.CylinderGeometry(1.4 * S, 1.4 * S, 5.8 * S, 20).rotateZ(Math.PI / 2), []);
  const headGeo = useMemo(() => new THREE.CylinderGeometry(2.1 * S, 2.1 * S, 1.2 * S, 24).rotateZ(Math.PI / 2), []);
  const keeperGeo = useMemo(() => new THREE.BoxGeometry(1.6 * S, 14 * S, 0.11), []);
  return (
    <>
      <group ref={cams}>
        {CAMS.map((z) => (
          <group key={z} position={[0, Y(67.5), z]}>
            <mesh geometry={camGeo} material={material} position={[X(59.7), 0, 0]} castShadow />
            <mesh geometry={headGeo} material={material} position={[X(62.4), 0, 0]} castShadow />
          </group>
        ))}
      </group>
      {CAMS.map((z) => (
        <mesh key={z} geometry={keeperGeo} material={material} position={[X(63.6), Y(63), z + 0.075]} castShadow receiveShadow />
      ))}
    </>
  );
}

/** Screws fixing the steel reinforcement through the frame wall. */
function Screws({ material }: { material: THREE.Material }) {
  const geo = useMemo(() => new THREE.CylinderGeometry(0.9 * S, 0.9 * S, 7 * S, 12), []);
  return SCREWS.map((z) => <mesh key={z} geometry={geo} material={material} position={[X(35), Y(46), z]} />);
}

function Profile({ stateRef }: { stateRef: React.RefObject<ProfileState> }) {
  const group = useRef<THREE.Group>(null);
  const steelA = useRef<THREE.Mesh>(null);
  const steelB = useRef<THREE.Mesh>(null);
  const unitOut = useRef<THREE.Group>(null);
  const unitIn = useRef<THREE.Group>(null);
  const gaskets = useRef<THREE.Group>(null);
  const cams = useRef<THREE.Group>(null);
  const shapes = useShapes();

  const mats = useMemo(
    () => ({
      upvc: new THREE.MeshPhysicalMaterial({ color: "#f1f2f0", roughness: 0.34, clearcoat: 0.35, clearcoatRoughness: 0.35, transparent: true }),
      steel: new THREE.MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.6, roughness: 0.34 }),
      gasket: new THREE.MeshStandardMaterial({ color: "#121316", roughness: 0.85, emissive: "#000000" }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#cfe6df",
        roughness: 0.04,
        metalness: 0.1,
        transparent: true,
        opacity: 0.32,
        envMapIntensity: 1.6,
        depthWrite: false,
      }),
      spacer: new THREE.MeshStandardMaterial({ color: "#a7b0ba", metalness: 0.8, roughness: 0.3 }),
      desiccant: new THREE.MeshStandardMaterial({ color: "#d8cdb4", roughness: 0.95 }),
      seal: new THREE.MeshStandardMaterial({ color: "#26292e", roughness: 0.7 }),
      block: new THREE.MeshStandardMaterial({ color: "#3b4250", roughness: 0.8 }),
      hardware: new THREE.MeshStandardMaterial({ color: "#b9c0c8", metalness: 0.85, roughness: 0.28 }),
      screw: new THREE.MeshStandardMaterial({ color: "#6c7480", metalness: 0.9, roughness: 0.35 }),
    }),
    [],
  );

  const v = useRef({ rotY: -0.95, rotX: 0.32, steel: 0, ghost: 1, gasket: 0, explode: 0, hlProfile: 0, hlGlass: 0, lock: 0 }).current;

  useFrame((frame, delta) => {
    const step = stateRef.current.step;
    const k = 1 - Math.pow(0.0015, delta); // frame-rate independent easing
    // Each step turns the cut face toward the camera at its own angle.
    const target = {
      rotY: [-0.62, -0.2, -0.95, -0.3, -0.45, -1.15][step] ?? -0.5,
      rotX: [0.26, 0.08, 0.3, 0.1, 0.18, 0.14][step] ?? 0.2,
      steel: step === 2 ? 1 : 0,
      ghost: step === 2 || step === 3 ? 0.35 : step === 5 ? 0.6 : 1,
      gasket: step === 3 ? 1 : 0,
      explode: step === 4 ? 1 : 0,
      // Red marks the part being explained: profile, steel core, gaskets, glass.
      hlProfile: step === 1 ? 1 : 0,
      hlGlass: step === 4 ? 1 : 0,
      // Locking: the hardware turns red and the cams slide into their keepers.
      lock: step === 5 ? 1 : 0,
    };
    for (const key of Object.keys(target) as (keyof typeof target)[]) v[key] += (target[key] - v[key]) * k;

    const g = group.current;
    if (!g) return;
    const t = frame.clock.elapsedTime;
    g.rotation.y = v.rotY + Math.sin(t * 0.4) * 0.04;
    g.rotation.x = v.rotX + Math.sin(t * 0.3) * 0.02;
    g.position.y = Math.sin(t * 0.6) * 0.02;

    if (steelA.current) steelA.current.position.z = v.steel * 0.62;
    if (steelB.current) steelB.current.position.z = v.steel * 0.42;
    mats.upvc.opacity = v.ghost;
    mats.upvc.depthWrite = v.ghost > 0.95;
    mats.upvc.color.lerpColors(WHITE, RED, v.hlProfile);
    mats.steel.color.lerpColors(STEEL, RED, v.steel);
    mats.steel.emissive.lerpColors(BLACK, DEEP_RED, v.steel);
    mats.gasket.color.lerpColors(BLACK, RED, v.gasket);
    mats.gasket.emissive.lerpColors(BLACK, DEEP_RED, v.gasket);
    mats.glass.color.lerpColors(GLASS, RED, v.hlGlass * 0.7);
    mats.glass.opacity = 0.32 + v.hlGlass * 0.28;
    if (gaskets.current) gaskets.current.scale.setScalar(1 + v.gasket * 0.06);
    mats.hardware.color.lerpColors(METAL, RED, v.lock);
    mats.hardware.emissive.lerpColors(BLACK, DEEP_RED, v.lock);
    if (cams.current) cams.current.position.z = v.lock * 0.075;
    // The glass unit opens up: panes move apart, the spacer and seals stay between them.
    if (unitOut.current) unitOut.current.position.x = -v.explode * 0.16;
    if (unitIn.current) unitIn.current.position.x = v.explode * 0.16;
  });

  return (
    <group ref={group}>
      <Part shape={shapes.frame} material={mats.upvc} />
      <Part shape={shapes.sash} material={mats.upvc} />
      <Part shape={shapes.bead} material={mats.upvc} />
      <Part shape={shapes.steelFrame} material={mats.steel} depth={LENGTH * 0.94} bevel={false} partRef={steelA} />
      <Part shape={shapes.steelSash} material={mats.steel} depth={LENGTH * 0.94} bevel={false} partRef={steelB} />
      <group ref={unitOut}>
        <Part shape={shapes.paneOut} material={mats.glass} bevel={false} />
        <Part shape={shapes.butyl[0]} material={mats.seal} bevel={false} />
      </group>
      <group ref={unitIn}>
        <Part shape={shapes.paneIn} material={mats.glass} bevel={false} />
        <Part shape={shapes.butyl[1]} material={mats.seal} bevel={false} />
      </group>
      <Part shape={shapes.spacer} material={mats.spacer} bevel={false} />
      <Part shape={shapes.desiccant} material={mats.desiccant} bevel={false} />
      <Part shape={shapes.edgeSeal} material={mats.seal} bevel={false} />
      <Part shape={shapes.settingBlock} material={mats.block} bevel={false} />
      <Part shape={shapes.rod} material={mats.hardware} depth={LENGTH * 0.98} bevel={false} />
      <LockHardware material={mats.hardware} cams={cams} />
      <Screws material={mats.screw} />
      <group ref={gaskets}>
        {shapes.gaskets.map((s, i) => (
          <Part key={i} shape={s} material={mats.gasket} bevel={false} />
        ))}
      </group>
    </group>
  );
}

/** Studio reflections from three's built-in room environment (nothing to download). */
function StudioLight() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Tells the page once the first frame is on screen, so the poster can fade out. */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady?.());
  });
  return null;
}

/** The WebGL canvas. Rendering pauses entirely while `active` is false. */
export default function ProfileScene({
  stateRef,
  active,
  onReady,
}: {
  stateRef: React.RefObject<ProfileState>;
  active: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [0.15, 0.2, 4.3], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 1, -2]} intensity={0.5} color="#b8c7da" />
      <pointLight position={[4, -1, -2]} intensity={1.2} color="#d71920" distance={8} />
      <StudioLight />
      <Profile stateRef={stateRef} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.05, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
