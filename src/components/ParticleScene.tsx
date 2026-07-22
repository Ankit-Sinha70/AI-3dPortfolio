import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// The actual three.js particle scene, split out of HeroCanvas.tsx so it can
// be lazy-loaded as a separate chunk (see HeroCanvas.tsx) -- keeps the heavy
// three.js bundle off the critical path / TTI.

const PARTICLE_COUNT = 700;

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

const positions = useMemo(() => {
  const arr = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 9;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  return arr;
}, []);

useFrame((_state, delta) => {
  if (!pointsRef.current) return;
  pointsRef.current.rotation.y += delta * 0.025;
  pointsRef.current.rotation.x += delta * 0.008;
});

return (
  <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
  <PointMaterial
    transparent
    color="#5eead4"
    size={0.035}
    sizeAttenuation
    depthWrite={false}
    opacity={0.7}
    />
  </Points>
  );
}

export default function ParticleScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
      >
    <ParticleField />
    </Canvas>
    );
}
</Points>
