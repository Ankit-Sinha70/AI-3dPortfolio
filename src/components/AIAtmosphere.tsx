import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uPixelRatio;
varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;
  vec3 p = position;
  float wave = sin(p.x * 5.0 + uTime * 0.28) * 0.035;
  wave += sin(p.y * 7.0 - uTime * 0.2) * 0.025;
  p.z += wave + uScroll * 0.12;
  vDepth = p.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (2.0 + 2.2 * (1.0 - length(p.xy) / 3.0)) * uPixelRatio;
}`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying float vDepth;

void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float soft = smoothstep(0.5, 0.02, d);
  float pulse = 0.65 + 0.35 * sin(uTime * 1.4 + vDepth * 12.0);
  vec3 accent = vec3(0.369, 0.918, 0.831);
  vec3 warm = vec3(1.0, 0.851, 0.627);
  vec3 color = mix(accent, warm, pulse * 0.18);
  gl_FragColor = vec4(color, soft * 0.32);
}`;

function Field() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const points = useRef<THREE.Points>(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());
  const scroll = useRef(0);

  const positions = useMemo(() => {
    const count = 420;
    const array = new Float32Array(count * 3);
    const random = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i += 1) {
      const radius = Math.sqrt(random(i + 1)) * 3.2;
      const angle = random(i + 101) * Math.PI * 2;
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
      array[i * 3 + 2] = (random(i + 201) - 0.5) * 2.5;
    }
    return array;
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useFrame(({ clock, size }) => {
    pointer.current.lerp(target.current, 0.025);
    if (material.current) {
      material.current.uniforms.uTime.value = clock.getElapsedTime();
      material.current.uniforms.uScroll.value = scroll.current;
      material.current.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5);
    }
    if (points.current) {
      points.current.rotation.z = clock.getElapsedTime() * 0.012 + pointer.current.x * 0.035;
      points.current.rotation.x = pointer.current.y * 0.025;
      points.current.position.x = pointer.current.x * 0.08;
      points.current.position.y = pointer.current.y * 0.05 - scroll.current * 0.12;
    }
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uPixelRatio: { value: 1 },
        }}
      />
    </points>
  );
}

export default function AIAtmosphere() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
    >
      <Field />
    </Canvas>
  );
}
