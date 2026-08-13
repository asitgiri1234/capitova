"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getScrollState } from "@/lib/scrollStore";
import {
  fieldState,
  sampleComposition,
  setCompactField,
} from "@/lib/particles/composition";
import ParticleField from "./ParticleField";

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

/** Particle budget by device class, decided once on mount. */
function pickParticleCount(): number {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;

  let count: number;
  if (width <= MOBILE_MAX) count = 18000;
  else if (width <= TABLET_MAX) count = 28000;
  else count = cores >= 8 ? 90000 : 55000;

  // Weak CPUs usually pair with weak GPUs; start conservative rather than
  // waiting for the frame-rate watchdog to catch it.
  if (cores < 4) count = Math.round(count / 2);

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[capitova] particle tier: ${count.toLocaleString("en-US")} (viewport ${width}px, ${cores} cores)`,
    );
  }

  return count;
}

/** The field has to sit further back on a narrow viewport or it crops. */
function cameraZFor(width: number) {
  if (width <= MOBILE_MAX) return 26;
  if (width <= TABLET_MAX) return 21;
  return 16;
}

function Rig({
  reducedMotion,
  activeRef,
  count,
  onDegrade,
}: {
  reducedMotion: boolean;
  activeRef: React.RefObject<boolean>;
  count: number;
  onDegrade: () => void;
}) {
  const frameRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const baseZ = useRef(16);

  // Frame-rate watchdog state.
  const slowFor = useRef(0);
  const degraded = useRef(false);

  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const sync = () => {
      baseZ.current = cameraZFor(window.innerWidth);
      setCompactField(window.innerWidth <= TABLET_MAX);
      invalidate();
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [invalidate]);

  // frameloop is "demand" under reduced motion, so scrolling must explicitly
  // request a frame or the field would never update its shape.
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
      camera.position.z = baseZ.current;
      return;
    }

    // Sustained sub-30fps for two seconds: halve the budget, once.
    if (!degraded.current && delta > 1 / 30) {
      slowFor.current += delta;
      if (slowFor.current >= 2) {
        degraded.current = true;
        onDegrade();
      }
    } else if (delta <= 1 / 30) {
      slowFor.current = 0;
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
    const targetZ = baseZ.current + getScrollState().progress * 6;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
  });

  return (
    <group ref={frameRef}>
      <group ref={spinRef}>
        <ParticleField
          count={count}
          reducedMotion={reducedMotion}
          activeRef={activeRef}
        />
      </group>
    </group>
  );
}

export default function Scene() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(() => pickParticleCount());
  const activeRef = useRef(true);

  const [isMobile] = useState(() => window.innerWidth <= MOBILE_MAX);

  const onDegrade = useCallback(() => {
    setCount((current) => {
      const next = Math.round(current / 2);
      if (process.env.NODE_ENV !== "production") {
        console.info(
          `[capitova] sustained <30fps — particle count reduced to ${next.toLocaleString("en-US")}`,
        );
      }
      return next;
    });
  }, []);

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
      camera={{ fov: 45, position: [0, 0, cameraZFor(window.innerWidth)] }}
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
      }}
      frameloop={!visible ? "never" : reducedMotion ? "demand" : "always"}
    >
      <Rig
        reducedMotion={reducedMotion}
        activeRef={activeRef}
        count={count}
        onDegrade={onDegrade}
      />
    </Canvas>
  );
}
