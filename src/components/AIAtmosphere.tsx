import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
attribute float aSize;
attribute float aSeed;
varying float vSeed;

void main() {
  vec3 p = position;
  float t = uTime * (0.08 + aSeed * 0.08);
  p.x += sin(t + aSeed * 12.0) * 0.08;
  p.y += cos(t * 1.2 + aSeed * 8.0) * 0.08 - uScroll * 0.22;
  p.z += sin(t * 0.7 + aSeed * 5.0) * 0.06;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * 1.5 * (130.0 / max(1.0, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
  vSeed = aSeed;
}`;

const fragmentShader = `
varying float vSeed;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float glow = smoothstep(0.5, 0.0, d);
  vec3 cyan = vec3(0.369, 0.918, 0.831);
  vec3 violet = vec3(0.55, 0.42, 1.0);
  vec3 color = mix(cyan, violet, fract(vSeed * 5.0));
  gl_FragColor = vec4(color, glow * 0.28);
}`;

export default function AIAtmosphere() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
  }), []);

  const { positions, sizes, seeds } = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.2 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 1.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
      sizes[i] = 0.7 + Math.random() * 1.6;
      seeds[i] = Math.random();
    }

    return { positions, sizes, seeds };
  }, []);

  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uScroll.value = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
}
