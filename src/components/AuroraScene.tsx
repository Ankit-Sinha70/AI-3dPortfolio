import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Aurora shader variant of the hero visual -- an alternative to the default
// particle field in ParticleScene.tsx. NOT wired up as the active variant
// (see HERO_VARIANT in HeroCanvas.tsx): this ships dormant because this
// workflow has no local dev server to visually verify raw WebGL shader
// output before it goes live on production. To preview it, flip
// HERO_VARIANT to 'aurora' in HeroCanvas.tsx and run `npm run dev` locally,
// then flip it back (or promote it to the default) once it's been eyeballed.
// See docs/ISSUES_BACKLOG.md for the follow-up line tracking that step.
//
// Renders a full-viewport plane with a slow-drifting gradient blending the
// --accent and --warm design tokens, driven by a single uTime uniform.

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec3 accent = vec3(0.369, 0.918, 0.831); // #5eead4
    vec3 warm = vec3(1.0, 0.851, 0.627);     // #ffd9a0

    float wave = 0.5 + 0.5 * sin(vUv.x * 2.5 + uTime * 0.15 + vUv.y * 1.5);
    vec3 color = mix(accent, warm, wave);

    float vignette = smoothstep(1.0, 0.2, distance(vUv, vec2(0.5)));
    float alpha = 0.22 * vignette;

    gl_FragColor = vec4(color, alpha);
  }
`;

function AuroraPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={[12, 8, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function AuroraScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <AuroraPlane />
    </Canvas>
  );
}
