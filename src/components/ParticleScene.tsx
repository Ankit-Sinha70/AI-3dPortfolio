import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// The actual three.js particle scene, split out of HeroCanvas.tsx so it can
// be lazy-loaded as a separate chunk (see HeroCanvas.tsx) -- keeps the heavy
// three.js bundle off the critical path / TTI.

const PARTICLE_COUNT = 700;

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  // Pointer-reactive parallax: track normalized pointer position (-1..1)
  // and lerp the field gently toward it each frame, layered on top of the
  // existing auto-rotation. Purely additive -- if pointermove never fires
  // (touch devices, or the user simply hasn't moved the mouse yet) the
  // field just keeps its original auto-rotation behavior.
  const pointer = useRef({ x: 0, y: 0 });
  const parallax = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

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

  // Ease the tracked pointer toward its target so the parallax drifts
  // smoothly rather than snapping to the cursor.
  const ease = Math.min(delta * 2, 1);
  parallax.current.x += (pointer.current.x - parallax.current.x) * ease;
  parallax.current.y += (pointer.current.y - parallax.current.y) * ease;

  pointsRef.current.rotation.y += parallax.current.x * 0.12 * delta;
  pointsRef.current.position.x = parallax.current.x * 0.4;
  pointsRef.current.position.y = parallax.current.y * -0.25;
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
