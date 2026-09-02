import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
uniform float uTime;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 p = position;
  float wave =
    sin(p.y * 3.4 + uTime * 0.8) * 0.035 +
    sin(p.x * 5.2 - uTime * 0.55) * 0.02 +
    sin(p.z * 7.0 + uTime * 0.35) * 0.012;

  p += normalize(position) * (wave + uScroll * 0.08);
  vNormal = normalize(normalMatrix * normal);
  vPosition = p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const fragmentShader = `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 accent = vec3(0.369, 0.918, 0.831);
  vec3 warm = vec3(1.0, 0.851, 0.627);
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
  float bands = 0.5 + 0.5 * sin(vPosition.y * 8.0 + uTime * 1.2);
  vec3 color = mix(accent, warm, bands * 0.28) + accent * fresnel * 1.7;
  gl_FragColor = vec4(color, 0.55 + smoothstep(0.0, 0.9, fresnel) * 0.38);
}`;

function Core() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const targetPointer = useRef(new THREE.Vector2());
  const scroll = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
  }), []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      targetPointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetPointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    pointer.current.lerp(targetPointer.current, 0.045);

    if (material.current) {
      material.current.uniforms.uTime.value = time;
      material.current.uniforms.uScroll.value = scroll.current;
    }

    if (group.current) {
      group.current.rotation.y = time * 0.12 + pointer.current.x * 0.22;
      group.current.rotation.x = Math.sin(time * 0.22) * 0.08 + pointer.current.y * 0.12;
      const scale = 1 - scroll.current * 0.12;
      group.current.scale.setScalar(scale);
      group.current.position.y = pointer.current.y * 0.12 - scroll.current * 0.35;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.35, 5]} />
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          uniforms={uniforms}
        />
      </mesh>
      <mesh scale={1.055}>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh scale={1.16}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color="#ffd9a0" wireframe transparent opacity={0.055} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function AICoreScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Core />
    </Canvas>
  );
}
