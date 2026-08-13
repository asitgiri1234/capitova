"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getScrollState } from "@/lib/scrollStore";
import { fieldState, sampleComposition } from "@/lib/particles/composition";
import ParticleField from "./ParticleField";

/** Particle budget by device class, decided once on mount. */
function pickParticleCount(): number {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;

  const count =
    width < 640 ? 22000 : width < 1024 ? 40000 : cores >= 8 ? 90000 : 55000;

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[capitova] particle tier: ${count.toLocaleString("en-US")} (viewport ${width}px, ${cores} cores)`,
    );
  }

  return count;
}

function Rig({
  reducedMotion,
  activeRef,
}: {
  reducedMotion: boolean;
  activeRef: React.RefObject<boolean>;
}) {
  // Outer group carries the per-section framing, inner group spins. Putting
  // the offset on the spinning group would make the field orbit the origin.
  const frameRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  // frameloop is "demand" under reduced motion, so scrolling must explicitly
  // request a frame or the field would never update its shape.
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!reducedMotion) return;
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [invalidate, reducedMotion]);

  useFrame(({ camera }, delta) => {
    if (!activeRef.current) return;

    const composition = sampleComposition(fieldState.progress);

    // Reduced motion: framing snaps to the section, no easing, no spin.
    if (reducedMotion) {
      frameRef.current?.position.set(composition.x, composition.y, 0);
      frameRef.current?.scale.setScalar(composition.scale);
      return;
    }

    if (frameRef.current) {
      const frame = frameRef.current;
      frame.position.x += (composition.x - frame.position.x) * 0.05;
      frame.position.y += (composition.y - frame.position.y) * 0.05;
      const scale = frame.scale.x + (composition.scale - frame.scale.x) * 0.05;
      frame.scale.setScalar(scale);
    }

    if (spinRef.current) {
      spinRef.current.rotation.y += 0.02 * delta;
    }

    // Subtle dolly back as the page scrolls.
    const targetZ = 16 + getScrollState().progress * 6;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
  });
  return (
    <group ref={frameRef}>
      <group ref={spinRef}>
        <ParticleFieldSlot
          reducedMotion={reducedMotion}
          activeRef={activeRef}
        />
      </group>
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
