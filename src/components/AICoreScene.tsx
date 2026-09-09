import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ProjectScene from './ProjectScene';

type MotionState = {
  progress: number;
  velocity: number;
  targetVelocity: number;
  lastY: number;
  lastTime: number;
};
type MotionRef = React.MutableRefObject<MotionState>;

function useScrollMotion(): MotionRef {
  const state = useRef<MotionState>({
    progress: 0,
    velocity: 0,
    targetVelocity: 0,
    lastY: 0,
    lastTime: 0,
  });

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(now - state.current.lastTime, 16);
      state.current.targetVelocity = THREE.MathUtils.clamp(
        ((y - state.current.lastY) / dt) * 0.055,
        -1,
        1,
      );
      state.current.lastY = y;
      state.current.lastTime = now;
      state.current.progress = THREE.MathUtils.clamp(
        y / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1),
        0,
        1,
      );
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return state;
}

const particleVertexShader = `
uniform float uTime;
uniform float uPixelRatio;
uniform float uScroll;
uniform float uVelocity;
attribute float aSize;
attribute float aSeed;
varying float vSeed;
void main(){
  vec3 p=position;
  float t=uTime*(.08+aSeed*.08);
  float motion=1.+abs(uVelocity)*2.4;
  p.x+=sin(t+aSeed*12.)*.08*motion;
  p.y+=cos(t*1.2+aSeed*8.)*.08*motion-uScroll*.32;
  p.z+=sin(t*.7+aSeed*5.)*.06*motion;
  vec4 mvPosition=modelViewMatrix*vec4(p,1.);
  gl_PointSize=aSize*uPixelRatio*(155./max(1.,-mvPosition.z));
  gl_Position=projectionMatrix*mvPosition;
  vSeed=aSeed;
}`;

const particleFragmentShader = `
varying float vSeed;
void main(){
  vec2 uv=gl_PointCoord-.5;
  float d=length(uv);
  float glow=smoothstep(.5,0.,d);
  vec3 color=mix(vec3(.369,.918,.831),vec3(.55,.42,1.),fract(vSeed*5.));
  gl_FragColor=vec4(color,glow*.3);
}`;

function Atmosphere({ motion }: { motion: MotionRef }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, sizes, seeds } = useMemo(() => {
    const count = 620;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.2 + Math.random() * 4.8;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
      sizes[i] = 0.7 + Math.random() * 2;
      seeds[i] = Math.random();
    }

    return { positions, sizes, seeds };
  }, []);

  useFrame(({ clock, gl }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uScroll.value = motion.current.progress;
    material.current.uniforms.uVelocity.value = motion.current.velocity;
    material.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5);
    motion.current.velocity = THREE.MathUtils.lerp(
      motion.current.velocity,
      motion.current.targetVelocity,
      0.08,
    );
    motion.current.targetVelocity *= 0.9;
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
          uVelocity: { value: 0 },
        }}
      />
    </points>
  );
}

const planetVertexShader = `
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main(){
  vNormal=normalize(normalMatrix*normal);
  vec4 world=modelMatrix*vec4(position,1.);
  vWorldPosition=world.xyz;
  gl_Position=projectionMatrix*viewMatrix*world;
}`;

const planetFragmentShader = `
uniform float uTime;
uniform vec3 uBase;
uniform float uType;
varying vec3 vNormal;
varying vec3 vWorldPosition;

float hash(vec3 p){
  p=fract(p*.3183099+.1);
  p*=17.;
  return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}

float noise(vec3 p){
  vec3 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  float a=hash(i),b=hash(i+vec3(1,0,0)),c=hash(i+vec3(0,1,0)),d=hash(i+vec3(1,1,0));
  float e=hash(i+vec3(0,0,1)),f1=hash(i+vec3(1,0,1)),g=hash(i+vec3(0,1,1)),h=hash(i+vec3(1,1,1));
  return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,f1,f.x),mix(g,h,f.x),f.y),f.z);
}

float fbm(vec3 p){
  float value=0., amplitude=.5;
  for(int i=0;i<4;i++){
    value+=noise(p)*amplitude;
    p*=2.03;
    amplitude*=.5;
  }
  return value;
}

void main(){
  vec3 n=normalize(vNormal);
  vec3 lightDir=normalize(-vWorldPosition);
  vec3 viewDir=normalize(cameraPosition-vWorldPosition);
  float diffuse=max(dot(n,lightDir),0.);
  float wrapped=smoothstep(-.18,.58,diffuse);
  float rim=pow(1.-max(dot(n,viewDir),0.),3.2);
  vec3 c=uBase;
  vec3 q=normalize(vWorldPosition);

  if(uType<.5){
    float rock=fbm(q*8.);
    float crater=fbm(q*19.);
    c*=mix(.55,1.14,rock);
    c*=1.-smoothstep(.62,.8,crater)*.14;
  }else if(uType<1.5){
    float cloud=fbm(q*5.5);
    c=mix(c,c*vec3(1.3,.9,.6),smoothstep(.43,.72,cloud));
  }else if(uType<2.5){
    float land=fbm(q*2.8+vec3(2.1,0,0));
    float detail=fbm(q*10.);
    vec3 ocean=vec3(.008,.09,.3);
    vec3 landC=mix(vec3(.035,.15,.045),vec3(.42,.5,.19),detail);
    c=mix(ocean,landC,smoothstep(.5,.6,land));
    float clouds=fbm(q*12.+vec3(0,uTime*.015,0));
    c=mix(c,vec3(.93,.96,1.),smoothstep(.63,.78,clouds)*.7);
  }else if(uType<3.5){
    float bands=sin((q.y+fbm(q*3.)*.2)*24.);
    c*=mix(.62,1.2,bands*.5+.5);
    c=mix(c,c*vec3(1.18,.86,.65),smoothstep(.5,.82,fbm(q*6.)));
  }else if(uType<4.5){
    float bands=sin((q.y+fbm(q*5.)*.12)*34.);
    c*=mix(.68,1.16,bands*.5+.5);
  }else if(uType<5.5){
    c*=mix(.78,1.1,fbm(q*5.));
  }else{
    float bands=sin((q.y+fbm(q*3.)*.15)*27.);
    c*=mix(.6,1.14,bands*.5+.5);
  }

  float night=1.-smoothstep(0.,.42,diffuse);
  vec3 shaded=c*(.035+.98*wrapped);
  shaded+=c*.018*night;
  float spec=pow(max(dot(reflect(-lightDir,n),viewDir),0.),58.);
  shaded+=vec3(1.,.82,.55)*spec*.2;
  shaded+=vec3(.02,.18,.32)*rim*.22;
  gl_FragColor=vec4(shaded,1.);
}`;

const atmosphereVertexShader = `
varying vec3 vNormal;
void main(){
  vNormal=normalize(normalMatrix*normal);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;

const atmosphereFragmentShader = `
varying vec3 vNormal;
void main(){
  float rim=pow(1.-max(dot(vNormal,vec3(0,0,1)),0.),3.1);
  gl_FragColor=vec4(.18,.72,1.,rim*.32);
}`;

function PlanetAtmosphere({ size }: { size: number }) {
  return (
    <mesh scale={size * 1.07}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

const PLANETS = [
  { name: 'Mercury', base: '#8b857d', size: 0.12, distance: 0.78, speed: 1.8, phase: 0.2, type: 0 },
  { name: 'Venus', base: '#c7955c', size: 0.16, distance: 1.08, speed: 1.35, phase: 1.5, type: 1 },
  { name: 'Earth', base: '#3d8fc7', size: 0.38, distance: 1.46, speed: 1.05, phase: 2.5, type: 2, earth: true, focus: true },
  { name: 'Mars', base: '#b95b42', size: 0.15, distance: 1.84, speed: 0.82, phase: 3.7, type: 0, focus: true },
  { name: 'Jupiter', base: '#b99770', size: 0.29, distance: 2.28, speed: 0.55, phase: 4.5, type: 3, focus: true },
  { name: 'Saturn', base: '#c8b27e', size: 0.27, distance: 2.76, speed: 0.42, phase: 5.3, type: 4, ring: true, focus: true },
  { name: 'Uranus', base: '#79c1c6', size: 0.2, distance: 3.18, speed: 0.32, phase: 0.9, type: 5, focus: true },
  { name: 'Neptune', base: '#426dc0', size: 0.2, distance: 3.58, speed: 0.26, phase: 2.2, type: 6, focus: true },
] as const;

const FOCUS_STOPS = [0.055, 0.19, 0.325, 0.46, 0.595, 0.73];

function focusAmount(progress: number, index: number) {
  if (index === 2) {
    return THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((0.19 - progress) / 0.16, 0, 1), 0, 1);
  }

  const center = FOCUS_STOPS[index - 2] ?? 0;
  const width = index >= 5 ? 0.105 : 0.095;
  const distance = Math.abs(progress - center);
  return THREE.MathUtils.clamp(1 - distance / width, 0, 1);
}

function Planet({ data, motion, index }: { data: typeof PLANETS[number]; motion: MotionRef; index: number }) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());

  useEffect(() => {
    const move = (event: PointerEvent) => {
      target.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const time = clock.getElapsedTime();
    const progress = motion.current.progress;
    const isMobile = window.innerWidth < 800;
    pointer.current.lerp(target.current, 0.045);

    const galaxyReveal = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp((progress - 0.79) / 0.17, 0, 1),
      0,
      1,
    );
    const focus = data.focus ? focusAmount(progress, index) : 0;
    const angle = data.phase + time * data.speed * 0.045 + progress * (index % 2 ? 1.15 : -0.8);
    const orbitRadius = data.distance * THREE.MathUtils.lerp(0.78, 1.12, galaxyReveal);
    const orbitX = Math.cos(angle) * orbitRadius;
    const orbitY = Math.sin(angle * 0.72) * orbitRadius * 0.2;
    const orbitZ = -1.72 - data.distance * 0.2 + Math.sin(angle) * 0.28;

    const focusX = isMobile ? 0.48 : 0.98;
    const focusY = isMobile ? 0.02 : 0.04;
    const focusZ = 0.62;
    const x = THREE.MathUtils.lerp(orbitX, focusX, focus);
    const y = THREE.MathUtils.lerp(orbitY, focusY, focus);
    const z = THREE.MathUtils.lerp(orbitZ, focusZ, focus);

    const baseScale = data.name === 'Earth' ? 1.25 : 1.1;
    const focusScale = data.name === 'Earth' ? 4.05 : 4.45;
    const galaxyScale = THREE.MathUtils.lerp(0.96, 1.18, galaxyReveal);
    const targetScale = data.focus
      ? baseScale * galaxyScale * THREE.MathUtils.lerp(1, focusScale, focus)
      : 0.92 * galaxyScale;
    const reveal = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp((progress - (index < 2 ? 0.0 : 0.035)) / 0.15, 0, 1),
      0,
      1,
    );

    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      x + pointer.current.x * (focus > 0.5 ? 0.035 : 0.065),
      0.075,
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      y + pointer.current.y * (focus > 0.5 ? 0.028 : 0.05),
      0.075,
    );
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, z, 0.075);
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, targetScale * reveal, 0.085),
    );
    group.current.rotation.y += 0.0025 + data.speed * 0.0008;
    group.current.rotation.x = pointer.current.y * 0.018;
    group.current.rotation.z = pointer.current.x * 0.012;

    if (material.current) material.current.uniforms.uTime.value = time;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[data.size, 72, 48]} />
        <shaderMaterial
          ref={material}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uBase: { value: new THREE.Color(data.base) },
            uType: { value: data.type },
          }}
        />
      </mesh>
      {data.earth && <PlanetAtmosphere size={data.size} />}
      {data.earth && (
        <mesh position={[data.size * 1.32, 0.015, 0.02]}>
          <sphereGeometry args={[0.05, 24, 16]} />
          <meshStandardMaterial color="#a7a49b" roughness={1} metalness={0} />
        </mesh>
      )}
      {data.ring && (
        <group rotation={[Math.PI / 2.45, 0.16, 0.08]}>
          <mesh>
            <ringGeometry args={[data.size * 1.35, data.size * 2.3, 128]} />
            <meshStandardMaterial
              color="#c5b58c"
              roughness={0.94}
              transparent
              opacity={0.72}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh scale={0.72}>
            <ringGeometry args={[data.size * 1.38, data.size * 1.65, 96]} />
            <meshBasicMaterial color="#f1dfb3" transparent opacity={0.32} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Sun() {
  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  const vertex = `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
  const fragment = `
    uniform float uTime;
    varying vec3 vP;
    float n(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
    void main(){
      float v=n(vP*8.+uTime*.08);
      vec3 c=mix(vec3(1.,.22,.015),vec3(1.,.9,.42),v);
      gl_FragColor=vec4(c*1.45,1.);
    }`;

  return (
    <group>
      <pointLight position={[0, 0, 0.2]} intensity={3.2} distance={11} color="#ffd18b" />
      <mesh>
        <sphereGeometry args={[0.23, 64, 40]} />
        <shaderMaterial
          ref={material}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={{ uTime: { value: 0 } }}
        />
      </mesh>
      <mesh scale={1.65}>
        <sphereGeometry args={[0.23, 40, 24]} />
        <meshBasicMaterial
          color="#ff9f38"
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function OrbitGuides({ motion }: { motion: MotionRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const progress = motion.current.progress;
    const reveal = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp((progress - 0.72) / 0.2, 0, 1),
      0,
      1,
    );
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.72, 1.08, reveal));
    group.current.rotation.z = progress * 0.035;
  });

  return (
    <group ref={group} position={[0.12, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
      {PLANETS.map((planet) => (
        <mesh key={planet.name} rotation={[0, 0, planet.phase * 0.18]}>
          <torusGeometry args={[planet.distance, 0.0045, 8, 160]} />
          <meshBasicMaterial
            color="#8edcff"
            transparent
            opacity={0.055}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function SolarSystem({ motion }: { motion: MotionRef }) {
  const system = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());

  useEffect(() => {
    const move = (event: PointerEvent) => {
      target.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame(({ clock }) => {
    if (!system.current) return;

    const progress = motion.current.progress;
    pointer.current.lerp(target.current, 0.04);
    const galaxy = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp((progress - 0.76) / 0.2, 0, 1),
      0,
      1,
    );
    const focusTravel = Math.sin(Math.min(progress, 0.78) * Math.PI * 2.2) * 0.035;

    system.current.position.x = THREE.MathUtils.lerp(
      0.32 + pointer.current.x * 0.04,
      0.14 + pointer.current.x * 0.09,
      galaxy,
    ) + focusTravel;
    system.current.position.y = THREE.MathUtils.lerp(
      0.01 + pointer.current.y * 0.025,
      0.06 + pointer.current.y * 0.07,
      galaxy,
    );
    system.current.position.z = THREE.MathUtils.lerp(-0.05, -0.18, galaxy);
    system.current.scale.setScalar(THREE.MathUtils.lerp(1, 1.06, galaxy));
    system.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.07) * 0.009;
    system.current.rotation.x = pointer.current.y * 0.018;
    system.current.rotation.y = pointer.current.x * 0.012;
  });

  return (
    <group ref={system}>
      <Sun />
      {PLANETS.map((planet, index) => (
        <Planet key={planet.name} data={planet} motion={motion} index={index} />
      ))}
      <OrbitGuides motion={motion} />
    </group>
  );
}

function Scene() {
  const motion = useScrollMotion();
  return (
    <>
      <Atmosphere motion={motion} />
      <SolarSystem motion={motion} />
      <ProjectScene />
    </>
  );
}

export default function AICoreScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.55], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <Scene />
    </Canvas>
  );
}
