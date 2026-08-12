"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TARGET_BUILDERS, mulberry32 } from "@/lib/particles/targets";
import {
  measureMorphBounds,
  morphProgressFromScroll,
} from "@/lib/particles/morphProgress";
import { particlesVertexShader } from "./shaders/particles.vert";
import { particlesFragmentShader } from "./shaders/particles.frag";

const MINT = new THREE.Color("#7bffc4");
const VIOLET = new THREE.Color("#a78bfa");

type ParticleFieldProps = {
  count: number;
  reducedMotion: boolean;
  activeRef: React.RefObject<boolean>;
};

export default function ParticleField({
  count,
  reducedMotion,
  activeRef,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const camera = useThree((state) => state.camera);

  const targets = useMemo(
    () => TARGET_BUILDERS.map((build) => build(count)),
    [count],
  );

  const perParticle = useMemo(() => {
    const rand = mulberry32(0x7ab1);
    const random = new Float32Array(count);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      random[i] = rand();
      scale[i] = 0.4 + rand() * 1.0;
    }
    return { random, scale };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uMouseStrength: { value: 0 },
      uSize: { value: 46 },
      uColorA: { value: MINT },
      uColorB: { value: VIOLET },
      uOpacity: { value: 0.62 },
    }),
    [],
  );

  // Pointer tracking, projected onto the z=0 plane in world space.
  const pointerTarget = useRef(new THREE.Vector3());
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    [],
  );

  useEffect(() => {
    if (reducedMotion) return;

    const onPointerMove = (event: PointerEvent) => {
      const ndc = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, hit)) {
        pointerTarget.current.copy(hit);
        uniforms.uMouseStrength.value = 1;
      }
    };

    const onPointerLeave = () => {
      uniforms.uMouseStrength.value = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [camera, plane, raycaster, reducedMotion, uniforms]);

  useEffect(() => {
    measureMorphBounds();

    // The canvas mounting can change layout; re-measure once it has painted so
    // pinned sections and morph boundaries agree.
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      measureMorphBounds();
    });

    const onResize = () => measureMorphBounds();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useFrame((_, delta) => {
    if (!activeRef.current) return;

    // Reduced motion: a still helix. No time, no morph, no cursor.
    if (reducedMotion) {
      uniforms.uProgress.value = 0;
      uniforms.uTime.value = 0;
      uniforms.uMouseStrength.value = 0;
      return;
    }

    uniforms.uTime.value += delta;

    const target = morphProgressFromScroll(window.scrollY, window.innerHeight);
    uniforms.uProgress.value +=
      (target - uniforms.uProgress.value) * 0.06;

    uniforms.uMouse.value.lerp(pointerTarget.current, 0.06);
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[targets[0], 3]}
          count={count}
          itemSize={3}
        />
        {targets.map((target, index) => (
          <bufferAttribute
            key={index}
            attach={`attributes-aTarget${index}`}
            args={[target, 3]}
            count={count}
            itemSize={3}
          />
        ))}
        <bufferAttribute
          attach="attributes-aRandom"
          args={[perParticle.random, 1]}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[perParticle.scale, 1]}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particlesVertexShader}
        fragmentShader={particlesFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
