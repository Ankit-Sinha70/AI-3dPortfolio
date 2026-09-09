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

const planetVertexShader = `varying vec3 vNormal;varying vec3 vWorldPosition;void main(){vec4 world=modelMatrix*vec4(position,1.);vWorldPosition=world.xyz;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*viewMatrix*world;}`;
const cloudVertexShader = `varying vec3 vNormal;varying vec3 vWorldPosition;void main(){vec4 world=modelMatrix*vec4(position,1.);vWorldPosition=world.xyz;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*viewMatrix*world;}`;

const planetFragmentShader = `uniform float uTime;uniform vec3 uBase;uniform vec3 uAccent;uniform vec3 uLightDir;uniform float uKind;varying vec3 vNormal;varying vec3 vWorldPosition;
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p*=2.03;a*=.5;}return v;}
void main(){vec3 n=normalize(vNormal);vec3 light=normalize(uLightDir);float ndl=max(dot(n,light),0.);float wrapped=max((dot(n,light)+.28)/1.28,0.);float rim=pow(1.-max(dot(n,normalize(cameraPosition-vWorldPosition)),0.),3.2);float cloud=fbm(n*7.+vec3(uTime*.025,0.,uTime*.012));float macro=fbm(n*2.7);vec3 color=uBase;
if(uKind<.5){float land=step(.52,fbm(n*4.1+vec3(3.,1.,2.)));float detail=fbm(n*12.);vec3 ocean=vec3(.018,.09,.17);vec3 landA=vec3(.12,.34,.16);vec3 landB=vec3(.43,.52,.25);color=mix(ocean,landA,land);color=mix(color,landB,smoothstep(.58,.78,detail)*land*.72);float ice=smoothstep(.76,1.,abs(n.y));color=mix(color,vec3(.72,.84,.88),ice*.72);color=mix(color,uAccent,cloud*.075);}
else if(uKind<1.5){float bands=.5+.5*sin(n.y*17.+fbm(n*5.)*3.);color=mix(uBase,uAccent,bands*.58);color*=.78+.22*macro;}
else if(uKind<2.5){float bands=.5+.5*sin(n.y*9.+fbm(n*3.)*2.);color=mix(uBase,uAccent,bands*.68);color*=.78+.22*macro;}
else {float bands=.5+.5*sin(n.y*24.+fbm(n*4.)*2.);color=mix(uBase,uAccent,bands*.5);color*=.8+.2*macro;}
color*=.18+.82*wrapped;color+=uAccent*rim*.16;float spec=pow(max(dot(reflect(-light,n),normalize(cameraPosition-vWorldPosition)),0.),52.);color+=vec3(1.)*spec*.34;gl_FragColor=vec4(color,1.);}`;

const cloudFragmentShader = `uniform float uTime;uniform vec3 uLightDir;varying vec3 vNormal;varying vec3 vWorldPosition;float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}void main(){vec3 n=normalize(vNormal);float clouds=noise(n*10.+vec3(uTime*.035,uTime*.012,0.));clouds=smoothstep(.56,.72,clouds);float light=max(dot(n,normalize(uLightDir)),0.);float rim=pow(1.-max(dot(n,normalize(cameraPosition-vWorldPosition)),0.),2.8);gl_FragColor=vec4(vec3(1.)*(clouds*(.18+.62*light)+rim*.07),clouds*.32+rim*.035);}`;
const atmosphereFragmentShader = `uniform vec3 uColor;varying vec3 vNormal;varying vec3 vWorldPosition;void main(){vec3 n=normalize(vNormal);vec3 viewDir=normalize(cameraPosition-vWorldPosition);float rim=pow(1.-max(dot(n,viewDir),0.),3.1);gl_FragColor=vec4(uColor*(.22+rim*2.1),rim*.6);}`;
const sunFragmentShader = `uniform float uTime;varying vec3 vNormal;varying vec3 vWorldPosition;float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}void main(){float n=noise(normalize(vWorldPosition)*7.+uTime*.16);vec3 c=mix(vec3(1.,.32,.035),vec3(1.,.86,.35),n);gl_FragColor=vec4(c*(1.05+n*.7),1.);}`;

const PLANETS = [
  { name: 'Mercury', base: '#8c8a86', accent: '#c8c2b6', size: .12, distance: .78, speed: 1.8, phase: .2, kind: 2 },
  { name: 'Venus', base: '#c88b4d', accent: '#f0cf8c', size: .18, distance: 1.15, speed: 1.35, phase: 1.5, kind: 1 },
  { name: 'Earth', base: '#1c7da5', accent: '#6b9f55', size: .34, distance: 1.55, speed: 1.05, phase: 2.5, earth: true, kind: 0 },
  { name: 'Mars', base: '#9f3f28', accent: '#d47752', size: .2, distance: 1.95, speed: .82, phase: 3.7, kind: 2 },
  { name: 'Jupiter', base: '#a97650', accent: '#e2c7a4', size: .43, distance: 2.45, speed: .55, phase: 4.5, kind: 1 },
  { name: 'Saturn', base: '#c8a875', accent: '#e8d6ae', size: .37, distance: 2.95, speed: .42, phase: 5.3, ring: true, kind: 1 },
  { name: 'Uranus', base: '#6ebcc5', accent: '#c0eff0', size: .28, distance: 3.4, speed: .32, phase: .9, kind: 3 },
  { name: 'Neptune', base: '#315ca9', accent: '#6c9af0', size: .28, distance: 3.82, speed: .26, phase: 2.2, kind: 3 },
];

function RealPlanet({ data, motion, index }: { data: typeof PLANETS[number]; motion: MotionRef; index: number }) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const clouds = useRef<THREE.ShaderMaterial>(null);
  const atmosphere = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2()); const target = useRef(new THREE.Vector2());
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uBase: { value: new THREE.Color(data.base) }, uAccent: { value: new THREE.Color(data.accent) }, uLightDir: { value: new THREE.Vector3(-.72,.38,.72) }, uKind: { value: data.kind } }), [data]);
  useEffect(() => { const move = (e: PointerEvent) => target.current.set(e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); window.addEventListener('pointermove', move, { passive: true }); return () => window.removeEventListener('pointermove', move); }, []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime(); const p = motion.current.progress;
    pointer.current.lerp(target.current, .035);
    const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p - .08) / .62, 0, 1), 0, 1);
    const angle = data.phase + t * data.speed * .055 + p * (index % 2 ? 1.2 : -.8);
    const x = Math.cos(angle) * data.distance * reveal;
    const y = Math.sin(angle * .72) * data.distance * .2 * reveal;
    const z = -1.55 - data.distance * .16 + Math.sin(angle) * .35;
    const heroX = index === 2 ? .95 : 0;
    const heroY = index === 2 ? .02 : 0;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, THREE.MathUtils.lerp(heroX, x, reveal) + pointer.current.x * (.06 + index * .006), .06);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, THREE.MathUtils.lerp(heroY, y, reveal) + pointer.current.y * (.05 + index * .005), .06);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, z, .06);
    const scale = THREE.MathUtils.lerp(index === 2 ? 1.05 : .001, 1, reveal);
    group.current.scale.setScalar(scale);
    group.current.rotation.y += .0025 + data.speed * .0012;
    group.current.rotation.x = pointer.current.y * .055;
    if (material.current) material.current.uniforms.uTime.value = t + index * 3.1;
    if (clouds.current) clouds.current.uniforms.uTime.value = t + index * 2.7;
  });
  return <group ref={group}>
    <mesh>
      <sphereGeometry args={[data.size, 48, 32]} />
      <shaderMaterial ref={material} vertexShader={planetVertexShader} fragmentShader={planetFragmentShader} uniforms={uniforms} />
    </mesh>
    {data.earth && <>
      <mesh scale={1.025}><sphereGeometry args={[data.size, 40, 28]} /><shaderMaterial ref={clouds} vertexShader={cloudVertexShader} fragmentShader={cloudFragmentShader} uniforms={{ uTime: { value: 0 }, uLightDir: { value: new THREE.Vector3(-.72,.38,.72) } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh scale={1.09}><sphereGeometry args={[data.size, 32, 24]} /><shaderMaterial ref={atmosphere} vertexShader={planetVertexShader} fragmentShader={atmosphereFragmentShader} uniforms={{ uColor: { value: new THREE.Color('#63d9ff') } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} /></mesh>
      <group><mesh position={[data.size * 1.45, .025, 0]}><sphereGeometry args={[.075, 20, 16]} /><meshStandardMaterial color="#b9bec5" roughness={1} /></mesh><mesh position={[data.size * 1.45, .025, 0]} scale={1.35}><sphereGeometry args={[.075, 16, 12]} /><meshBasicMaterial color="#8bd9ff" transparent opacity={.12} blending={THREE.AdditiveBlending} /></mesh></group>
    </>}
    {data.ring && <>
      <mesh rotation={[Math.PI / 2.55, .18, .2]}><ringGeometry args={[data.size * 1.35, data.size * 2.15, 96]} /><meshStandardMaterial color="#c9b18a" roughness={.9} metalness={0} transparent opacity={.72} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[Math.PI / 2.55, .18, .2]}><ringGeometry args={[data.size * 2.18, data.size * 2.42, 96]} /><meshStandardMaterial color="#8f806c" roughness={1} transparent opacity={.42} side={THREE.DoubleSide} /></mesh>
    </>}
  </group>;
}

function Sun({ motion }: { motion: MotionRef }) {
  const group = useRef<THREE.Group>(null); const material = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime(); const p = motion.current.progress;
    const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p - .05) / .25, 0, 1), 0, 1);
    group.current.position.x = THREE.MathUtils.lerp(-1.55, -1.85, reveal); group.current.position.y = .08; group.current.position.z = -2.15;
    group.current.scale.setScalar(THREE.MathUtils.lerp(1.0, .62, reveal));
    if (material.current) material.current.uniforms.uTime.value = t;
  });
  return <group ref={group}><mesh><sphereGeometry args={[.42, 48, 32]} /><shaderMaterial ref={material} vertexShader={planetVertexShader} fragmentShader={sunFragmentShader} uniforms={{ uTime: { value: 0 } }} /></mesh><mesh scale={1.22}><sphereGeometry args={[.42, 32, 20]} /><meshBasicMaterial color="#ff9b3d" transparent opacity={.18} blending={THREE.AdditiveBlending} /></mesh><pointLight position={[0,0,.6]} intensity={4.5} distance={8} color="#ffb45e" /></group>;
}

function OrbitGuides({ motion }: { motion: MotionRef }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => { if (!group.current) return; const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((motion.current.progress - .16) / .45, 0, 1), 0, 1); group.current.scale.setScalar(reveal); });
  return <group ref={group}>{PLANETS.map((planet) => <mesh key={planet.name} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[planet.distance, .0025, 4, 128]} /><meshBasicMaterial color="#a9e8e2" transparent opacity={.04} /></mesh>)}</group>;
}

function SolarSystem({ motion }: { motion: MotionRef }) {
  const system = useRef<THREE.Group>(null); const pointer = useRef(new THREE.Vector2()); const target = useRef(new THREE.Vector2());
  useEffect(() => { const move = (e: PointerEvent) => target.current.set(e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); window.addEventListener('pointermove', move, { passive: true }); return () => window.removeEventListener('pointermove', move); }, []);
  useFrame(({ clock }) => { if (!system.current) return; pointer.current.lerp(target.current, .04); const p = motion.current.progress; const reveal = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p - .1) / .58, 0, 1), 0, 1); system.current.position.x = THREE.MathUtils.lerp(.7, 0, reveal) + pointer.current.x * .12; system.current.position.y = pointer.current.y * .1; system.current.rotation.z = Math.sin(clock.getElapsedTime() * .08) * .012; });
  return <group ref={system}><Sun motion={motion} />{PLANETS.map((planet, index) => <RealPlanet key={planet.name} data={planet} motion={motion} index={index} />)}<OrbitGuides motion={motion} /></group>;
}

function Scene() { const motion = useScrollMotion(); return <><Atmosphere motion={motion} /><SolarSystem motion={motion} /></>; }

export default function AICoreScene() {
  return <Canvas camera={{ position: [0, 0, 4.25], fov: 36 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}><ambientLight intensity={.12} color="#d7e8ff" /><Scene /></Canvas>;
}
