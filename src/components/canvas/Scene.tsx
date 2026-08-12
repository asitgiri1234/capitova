"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getScrollState } from "@/lib/scrollStore";
import ParticleField from "./ParticleField";

/** Particle budget by device class, decided once on mount. */
function pickParticleCount(): number {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (width < 640) return 22000;
  if (width < 1024) return 40000;
  return cores >= 8 ? 90000 : 55000;
}

function Rig({
  reducedMotion,
  activeRef,
}: {
  reducedMotion: boolean;
  activeRef: React.RefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }, delta) => {
    if (!activeRef.current || reducedMotion) return;

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.02 * delta;
    }

    // Subtle dolly back as the page scrolls.
    const targetZ = 16 + getScrollState().progress * 6;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <ParticleFieldSlot reducedMotion={reducedMotion} activeRef={activeRef} />
    </group>
  );
}

function ParticleFieldSlot({
  reducedMotion,
  activeRef,
}: {
  reducedMotion: boolean;
  activeRef: React.RefObject<boolean>;
}) {
  const count = useMemo(() => pickParticleCount(), []);
  return (
    <ParticleField
      count={count}
      reducedMotion={reducedMotion}
      activeRef={activeRef}
    />
  );
}

export default function Scene() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const activeRef = useRef(true);

  useEffect(() => {
    const onVisibility = () => {
      const next = !document.hidden;
      activeRef.current = next;
      setVisible(next);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, 16] }}
      dpr={[1, 1.75]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
      }}
      frameloop={!visible ? "never" : reducedMotion ? "demand" : "always"}
    >
      <Rig reducedMotion={reducedMotion} activeRef={activeRef} />
    </Canvas>
  );
}
