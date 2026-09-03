import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const coreVertexShader = `
uniform float uTime;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDisplacement;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}

void main() {
  vec3 p = position;
  vec3 n = normalize(position);
  float organic = noise(n * 3.2 + uTime * 0.18);
  float ripple = sin(p.y * 5.0 + uTime * 0.9) * 0.018;
  float pulse = sin(uTime * 1.15) * 0.018;
  float displacement = (organic - 0.5) * 0.16 + ripple + pulse + uScroll * 0.08;
  p += n * displacement;
  vDisplacement = displacement;
  vNormal = normalize(normalMatrix * n);
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorldPosition = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const coreFragmentShader = `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDisplacement;

void main() {
  vec3 cyan = vec3(0.369, 0.918, 0.831);
  vec3 violet = vec3(0.42, 0.32, 0.95);
  vec3 warm = vec3(1.0, 0.78, 0.48);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.4);
  float latitude = 0.5 + 0.5 * sin(vWorldPosition.y * 7.0 - uTime * 1.1);
  float energy = smoothstep(0.02, 0.12, abs(vDisplacement));
  float scan = smoothstep(0.46, 0.5, 0.5 + 0.5 * sin(vWorldPosition.y * 15.0 - uTime * 2.2));
  vec3 color = mix(cyan, violet, latitude * 0.7);
  color = mix(color, warm, fresnel * 0.45);
  color += cyan * fresnel * 1.9;
  color += violet * energy * 0.55;
  color += warm * scan * fresnel * 0.35;
  float alpha = 0.48 + fresnel * 0.46;
  gl_FragColor = vec4(color, alpha);
}`;

const particleVertexShader = `
uniform float uTime;
uniform float uPixelRatio;
uniform float uScroll;
attribute float aSize;
attribute float aSeed;
varying float vSeed;

void main() {
  vec3 p = position;
  float t = uTime * (0.08 + aSeed * 0.08);
  float radius = length(p.xz);
  p.x += sin(t + aSeed * 12.0) * 0.08 * (1.0 + radius * 0.08);
  p.y += cos(t * 1.2 + aSeed * 8.0) * 0.08;
  p.z += sin(t * 0.7 + aSeed * 5.0) * 0.06;
  p.y -= uScroll * 0.32;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelRatio * (150.0 / max(1.0, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
  vSeed = aSeed;
}`;

const particleFragmentShader = `
varying float vSeed;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float glow = smoothstep(0.5, 0.0, d);
  vec3 color = mix(vec3(0.369, 0.918, 0.831), vec3(0.55, 0.42, 1.0), fract(vSeed * 5.0));
  gl_FragColor = vec4(color, glow * 0.34);
}`;

function Atmosphere() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const scroll = useRef(0);
  const { positions, sizes, seeds } = useMemo(() => {
    const count = 520;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.0 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.4;
      positions[i * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 1.3;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
      sizes[i] = 0.7 + Math.random() * 1.8;
      seeds[i] = Math.random();
    }
    return { positions, sizes, seeds };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame(({ clock, gl }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uScroll.value = scroll.current;
    material.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5);
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
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uScroll: { value: 0 },
        }}
      />
    </points>
  );
}

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
          vertexShader={coreVertexShader}
          fragmentShader={coreFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
        />
      </mesh>
      <mesh scale={1.045}>
        <icosahedronGeometry args={[1.35, 3]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh scale={1.105} rotation={[0.35, 0.2, 0]}>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshBasicMaterial color="#8b7cff" wireframe transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <mesh scale={1.19} rotation={[0, 0.7, 0.4]}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color="#ffd9a0" wireframe transparent opacity={0.055} depthWrite={false} />
      </mesh>
    </group>
  );
}

function EnergyRings() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.z = t * 0.06;
    group.current.rotation.x = Math.sin(t * 0.16) * 0.08;
    group.current.children.forEach((child, index) => {
      child.rotation.z = t * (index % 2 ? -0.16 : 0.1);
      child.scale.setScalar(1 + Math.sin(t * 0.7 + index) * 0.018);
    });
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0.12, 0]}>
        <torusGeometry args={[1.68, 0.008, 8, 96]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.26} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[1.1, -0.42, 0]}>
        <torusGeometry args={[1.9, 0.006, 8, 96]} />
        <meshBasicMaterial color="#8b7cff" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0.25, 0.8, 1.1]}>
        <torusGeometry args={[2.12, 0.004, 8, 96]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
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
      <Atmosphere />
      <EnergyRings />
      <Core />
    </Canvas>
  );
}
