import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MotionState = { progress: number; velocity: number; targetVelocity: number; lastY: number; lastTime: number };
type MotionRef = React.MutableRefObject<MotionState>;

function useScrollMotion(): MotionRef {
  const state = useRef<MotionState>({ progress: 0, velocity: 0, targetVelocity: 0, lastY: 0, lastTime: 0 });
  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(now - state.current.lastTime, 16);
      state.current.targetVelocity = THREE.MathUtils.clamp(((y - state.current.lastY) / dt) * 0.045, -1, 1);
      state.current.lastY = y;
      state.current.lastTime = now;
      state.current.progress = THREE.MathUtils.clamp(y / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 0, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
}

const particleVertexShader = `uniform float uTime;uniform float uPixelRatio;uniform float uScroll;uniform float uVelocity;attribute float aSize;attribute float aSeed;varying float vSeed;void main(){vec3 p=position;float t=uTime*(.08+aSeed*.08);float motion=1.+abs(uVelocity)*1.8;p.x+=sin(t+aSeed*12.)*.08*motion;p.y+=cos(t*1.2+aSeed*8.)*.08*motion-uScroll*.32;p.z+=sin(t*.7+aSeed*5.)*.06*motion;vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*uPixelRatio*(150./max(1.,-mvPosition.z));gl_Position=projectionMatrix*mvPosition;vSeed=aSeed;}`;
const particleFragmentShader = `varying float vSeed;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv),glow=smoothstep(.5,0.,d);vec3 color=mix(vec3(.369,.918,.831),vec3(.55,.42,1.),fract(vSeed*5.));gl_FragColor=vec4(color,glow*.34);}`;

function Atmosphere({ motion }: { motion: MotionRef }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, sizes, seeds } = useMemo(() => {
    const count = 520;
    const positions = new Float32Array(count * 3); const sizes = new Float32Array(count); const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const r = 2 + Math.random() * 3.8; const t = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(t) * r + (Math.random() - .5) * 1.3;
      positions[i * 3 + 1] = (Math.random() - .5) * 3.4;
      positions[i * 3 + 2] = Math.sin(t) * r;
      sizes[i] = .7 + Math.random() * 1.8; seeds[i] = Math.random();
    }
    return { positions, sizes, seeds };
  }, []);
  useFrame(({ clock, gl }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uScroll.value = motion.current.progress;
    material.current.uniforms.uVelocity.value = motion.current.velocity;
    material.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5);
    motion.current.velocity = THREE.MathUtils.lerp(motion.current.velocity, motion.current.targetVelocity, .08);
    motion.current.targetVelocity *= .9;
  });
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /><bufferAttribute attach="attributes-aSize" args={[sizes, 1]} /><bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} /></bufferGeometry><shaderMaterial ref={material} vertexShader={particleVertexShader} fragmentShader={particleFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uScroll: { value: 0 }, uVelocity: { value: 0 } }} /></points>;
}

const PLANETS = [
  { name: 'Mercury', color: '#9b9188', size: .13, distance: .72, speed: 1.8, phase: .2 },
  { name: 'Venus', color: '#d6a66a', size: .19, distance: 1.05, speed: 1.35, phase: 1.5 },
  { name: 'Earth', color: '#4d9fd8', size: .24, distance: 1.4, speed: 1.05, phase: 2.5, earth: true },
  { name: 'Mars', color: '#c8664a', size: .17, distance: 1.75, speed: .82, phase: 3.7 },
  { name: 'Jupiter', color: '#c9a77b', size: .38, distance: 2.2, speed: .55, phase: 4.5 },
  { name: 'Saturn', color: '#d8c28e', size: .33, distance: 2.7, speed: .42, phase: 5.3, ring: true },
  { name: 'Uranus', color: '#82c9cf', size: .27, distance: 3.15, speed: .32, phase: .9 },
  { name: 'Neptune', color: '#547ed1', size: .26, distance: 3.55, speed: .26, phase: 2.2 },
];

function Planet({ data, motion, index }: { data: typeof PLANETS[number]; motion: MotionRef; index: number }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());
  useEffect(() => {
    const move = (event: PointerEvent) => { target.current.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime(); const p = motion.current.progress;
    pointer.current.lerp(target.current, .035);
    const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p - .12) / .5, 0, 1), 0, 1);
    const angle = data.phase + t * data.speed * .055 + p * (index % 2 ? 1.2 : -.8);
    const x = Math.cos(angle) * data.distance * reveal;
    const y = Math.sin(angle * .72) * data.distance * .22 * reveal;
    const z = -1.25 - data.distance * .22 + Math.sin(angle) * .45;
    const heroX = index === 2 ? .95 : 0;
    const heroY = index === 2 ? .08 : 0;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, THREE.MathUtils.lerp(heroX, x, reveal) + pointer.current.x * (.06 + index * .008), .045);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, THREE.MathUtils.lerp(heroY, y, reveal) + pointer.current.y * (.05 + index * .006), .045);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, z, .045);
    const scale = THREE.MathUtils.lerp(index === 2 ? 1.9 : .001, 1, reveal);
    group.current.scale.setScalar(scale);
    group.current.rotation.y += .003 + data.speed * .001;
    group.current.rotation.x = pointer.current.y * .08;
  });
  return <group ref={group}>
    <mesh>
      <sphereGeometry args={[data.size, 32, 20]} />
      <meshStandardMaterial color={data.color} roughness={.82} metalness={.02} emissive={data.color} emissiveIntensity={index === 2 ? .08 : .025} />
    </mesh>
    {data.earth && <mesh scale={1.06}><sphereGeometry args={[data.size, 24, 16]} /><meshBasicMaterial color="#74e6e0" transparent opacity={.12} blending={THREE.AdditiveBlending} /></mesh>}
    {data.ring && <mesh rotation={[Math.PI / 2.55, .18, .2]}><ringGeometry args={[data.size * 1.45, data.size * 2.15, 64]} /><meshBasicMaterial color="#d9c28f" transparent opacity={.28} side={THREE.DoubleSide} /></mesh>}
    {data.earth && <group><mesh position={[data.size * 1.35, .02, 0]}><sphereGeometry args={[.055, 16, 12]} /><meshStandardMaterial color="#aaa" roughness={1} /></mesh></group>}
  </group>;
}

function SolarSystem({ motion }: { motion: MotionRef }) {
  const system = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2()); const target = useRef(new THREE.Vector2());
  useEffect(() => { const move = (e: PointerEvent) => target.current.set(e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); window.addEventListener('pointermove', move, { passive: true }); return () => window.removeEventListener('pointermove', move); }, []);
  useFrame(({ clock }) => {
    if (!system.current) return;
    const p = motion.current.progress; pointer.current.lerp(target.current, .04);
    const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p - .12) / .58, 0, 1), 0, 1);
    system.current.position.x = THREE.MathUtils.lerp(1.0 + pointer.current.x * .08, pointer.current.x * .18, reveal);
    system.current.position.y = THREE.MathUtils.lerp(.05 + pointer.current.y * .06, pointer.current.y * .14, reveal);
    system.current.rotation.z = Math.sin(clock.getElapsedTime() * .08) * .018;
  });
  return <group ref={system}><pointLight position={[0, 0, 1]} intensity={2.2} distance={8} color="#ffd9a0" /><mesh position={[0, 0, -1.15]}><sphereGeometry args={[.42, 32, 20]} /><meshBasicMaterial color="#ffbd65" transparent opacity={.72} blending={THREE.AdditiveBlending} /></mesh><mesh position={[0, 0, -1.18]}><sphereGeometry args={[.3, 32, 20]} /><meshBasicMaterial color="#fff0bd" /></mesh>{PLANETS.map((planet, index) => <Planet key={planet.name} data={planet} motion={motion} index={index} />)}<OrbitGuides motion={motion} /></group>;
}

function OrbitGuides({ motion }: { motion: MotionRef }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => { if (!group.current) return; const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((motion.current.progress - .16) / .48, 0, 1), 0, 1); group.current.scale.setScalar(reveal); });
  return <group ref={group}>{PLANETS.map((planet) => <mesh key={planet.name} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[planet.distance, .003, 4, 96]} /><meshBasicMaterial color="#9fe9e1" transparent opacity={.055} /></mesh>)}</group>;
}

function Scene() { const motion = useScrollMotion(); return <><Atmosphere motion={motion} /><SolarSystem motion={motion} /></>; }

export default function AICoreScene() {
  return <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}><ambientLight intensity={.34} color="#d8e8ff" /><Scene /></Canvas>;
}
