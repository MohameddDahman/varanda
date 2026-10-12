"use client";

/* eslint-disable react-hooks/immutability --
   Three.js materials and easing state are mutated inside useFrame every
   frame; that is how React Three Fiber animates without re-rendering. */

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Shared, mutable scroll state written by the DOM and read every frame. */
export type ProfileState = { step: number; progress: number };

type Pt = [number, number];
type Rect = [number, number, number, number]; // x1, y1, x2, y2 (mm)

const S = 0.01; // mm → world units
const CX = 35; // section centre (mm)
const CY = 86;
const LENGTH = 1.15; // a short slice, like a sample cut from a real profile

const poly = (pts: Pt[]) => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo((x - CX) * S, (y - CY) * S) : s.moveTo((x - CX) * S, (y - CY) * S)));
  s.closePath();
  return s;
};

const rectPath = ([x1, y1, x2, y2]: Rect) => {
  const p = new THREE.Path();
  p.moveTo((x1 - CX) * S, (y1 - CY) * S);
  p.lineTo((x1 - CX) * S, (y2 - CY) * S);
  p.lineTo((x2 - CX) * S, (y2 - CY) * S);
  p.lineTo((x2 - CX) * S, (y1 - CY) * S);
  p.closePath();
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

function useGeometry(shape: THREE.Shape, depth = LENGTH, bevel = true) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
      curveSegments: 6,
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

function Profile({ stateRef }: { stateRef: React.RefObject<ProfileState> }) {
  const group = useRef<THREE.Group>(null);
  const steelA = useRef<THREE.Mesh>(null);
  const steelB = useRef<THREE.Mesh>(null);
  const paneOut = useRef<THREE.Mesh>(null);
  const paneIn = useRef<THREE.Mesh>(null);
  const gaskets = useRef<THREE.Group>(null);

  const shapes = useMemo(() => {
    // Outer frame: stepped top with an exterior lip (left) and an interior lip (right).
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
    frame.holes.push(rectPath([3, 3, 17, 45]), rectPath([20, 3, 50, 45]), rectPath([53, 3, 67, 45]));

    // Sash: holds the glass in a rebate between an exterior upstand and the bead.
    const sash = poly([
      [9, 50],
      [60, 50],
      [60, 92],
      [17, 92],
      [17, 112],
      [9, 112],
    ]);
    sash.holes.push(rectPath([12, 53, 30, 89]), rectPath([33, 53, 57, 89]), rectPath([11.4, 95, 14.6, 108]));

    const bead = poly([
      [43, 92],
      [56, 92],
      [56, 103],
      [47, 108],
      [43, 108],
    ]);
    bead.holes.push(rectPath([45.5, 94.5, 53.5, 101]));

    return {
      frame,
      sash,
      bead,
      steelFrame: channel([21.6, 4.6, 48.4, 43.4]),
      steelSash: channel([34.6, 54.6, 55.4, 87.4]),
      paneOut: rectShape([18.4, 94, 22.6, 172]),
      paneIn: rectShape([37.4, 94, 41.6, 172]),
      spacer: rectShape([22.6, 94, 37.4, 101]),
      gaskets: [
        rectShape([17, 104, 18.4, 111]),
        rectShape([41.6, 99, 43, 106]),
        rectShape([6, 53, 9, 58]),
        rectShape([60, 50, 62.2, 54]),
      ],
    };
  }, []);

  const mats = useMemo(
    () => ({
      upvc: new THREE.MeshPhysicalMaterial({
        color: "#f1f2f0",
        roughness: 0.34,
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
        transparent: true,
      }),
      steel: new THREE.MeshStandardMaterial({ color: "#d3161e", metalness: 0.35, roughness: 0.36, emissive: "#3a0003" }),
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
      spacer: new THREE.MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.75, roughness: 0.32 }),
    }),
    [],
  );

  const v = useRef({ rotY: -0.95, rotX: 0.32, steel: 0, ghost: 1, gasket: 0, explode: 0 }).current;

  useFrame((frame, delta) => {
    const step = stateRef.current.step;
    const k = 1 - Math.pow(0.0015, delta); // frame-rate independent easing
    // Each step turns the cut face toward the camera at its own angle.
    const target = {
      rotY: [-0.62, -0.2, -0.95, -0.3, -0.45][step] ?? -0.5,
      rotX: [0.26, 0.08, 0.3, 0.1, 0.18][step] ?? 0.2,
      steel: step === 2 ? 1 : 0,
      ghost: step === 2 || step === 3 ? 0.35 : 1,
      gasket: step === 3 ? 1 : 0,
      explode: step === 4 ? 1 : 0,
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
    mats.steel.emissiveIntensity = 0.6 + v.steel * 2.2;
    // Gaskets glow white (red stays reserved for the steel).
    mats.gasket.emissive.setScalar(v.gasket * 0.9);
    if (gaskets.current) gaskets.current.scale.setScalar(1 + v.gasket * 0.08);
    if (paneOut.current) paneOut.current.position.x = -v.explode * 0.16;
    if (paneIn.current) paneIn.current.position.x = v.explode * 0.16;
  });

  return (
    <group ref={group}>
      <Part shape={shapes.frame} material={mats.upvc} />
      <Part shape={shapes.sash} material={mats.upvc} />
      <Part shape={shapes.bead} material={mats.upvc} />
      <Part shape={shapes.steelFrame} material={mats.steel} depth={LENGTH * 0.94} bevel={false} partRef={steelA} />
      <Part shape={shapes.steelSash} material={mats.steel} depth={LENGTH * 0.94} bevel={false} partRef={steelB} />
      <Part shape={shapes.spacer} material={mats.spacer} bevel={false} />
      <Part shape={shapes.paneOut} material={mats.glass} bevel={false} partRef={paneOut} />
      <Part shape={shapes.paneIn} material={mats.glass} bevel={false} partRef={paneIn} />
      <group ref={gaskets}>
        {shapes.gaskets.map((s, i) => (
          <Part key={i} shape={s} material={mats.gasket} bevel={false} />
        ))}
      </group>
    </group>
  );
}

/** The WebGL canvas. Rendering pauses entirely while `active` is false. */
export default function ProfileScene({ stateRef, active }: { stateRef: React.RefObject<ProfileState>; active: boolean }) {
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
      <Profile stateRef={stateRef} />
      <ContactShadows position={[0, -1.05, 0]} opacity={0.45} scale={6} blur={2.6} far={2.4} color="#02070e" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} position={[0, 3, 2]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#e11b22" position={[4, -1, -2]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
