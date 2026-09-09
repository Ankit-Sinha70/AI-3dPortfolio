import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ProjectScene from './ProjectScene';

type MotionState = { progress: number; velocity: number; targetVelocity: number; lastY: number; lastTime: number };
type MotionRef = React.MutableRefObject<MotionState>;

function useScrollMotion(): MotionRef {
  const state = useRef<MotionState>({ progress: 0, velocity: 0, targetVelocity: 0, lastY: 0, lastTime: 0 });
  useEffect(() => {
    const onScroll = () => {
      const now = performance.now(); const y = window.scrollY; const dt = Math.max(now - state.current.lastTime, 16);
      state.current.targetVelocity = THREE.MathUtils.clamp(((y - state.current.lastY) / dt) * 0.045, -1, 1);
      state.current.lastY = y; state.current.lastTime = now;
      state.current.progress = THREE.MathUtils.clamp(y / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 0, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
}

const particleVertexShader = `uniform float uTime;uniform float uPixelRatio;uniform float uScroll;uniform float uVelocity;attribute float aSize;attribute float aSeed;varying float vSeed;void main(){vec3 p=position;float t=uTime*(.08+aSeed*.08);float motion=1.+abs(uVelocity)*1.8;p.x+=sin(t+aSeed*12.)*.08*motion;p.y+=cos(t*1.2+aSeed*8.)*.08*motion-uScroll*.32;p.z+=sin(t*.7+aSeed*5.)*.06*motion;vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*uPixelRatio*(150./max(1.,-mvPosition.z));gl_Position=projectionMatrix*mvPosition;vSeed=aSeed;}`;
const particleFragmentShader = `varying float vSeed;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv),glow=smoothstep(.5,0.,d);vec3 color=mix(vec3(.369,.918,.831),vec3(.55,.42,1.),fract(vSeed*5.));gl_FragColor=vec4(color,glow*.25);}`;

function Atmosphere({ motion }: { motion: MotionRef }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, sizes, seeds } = useMemo(() => {
    const count = 520; const positions = new Float32Array(count * 3); const sizes = new Float32Array(count); const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) { const r = 2 + Math.random() * 3.8; const t = Math.random() * Math.PI * 2; positions[i * 3] = Math.cos(t) * r + (Math.random() - .5) * 1.3; positions[i * 3 + 1] = (Math.random() - .5) * 3.4; positions[i * 3 + 2] = Math.sin(t) * r; sizes[i] = .7 + Math.random() * 1.8; seeds[i] = Math.random(); }
    return { positions, sizes, seeds };
  }, []);
  useFrame(({ clock, gl }) => { if (!material.current) return; material.current.uniforms.uTime.value = clock.getElapsedTime(); material.current.uniforms.uScroll.value = motion.current.progress; material.current.uniforms.uVelocity.value = motion.current.velocity; material.current.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5); motion.current.velocity = THREE.MathUtils.lerp(motion.current.velocity, motion.current.targetVelocity, .08); motion.current.targetVelocity *= .9; });
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /><bufferAttribute attach="attributes-aSize" args={[sizes, 1]} /><bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} /></bufferGeometry><shaderMaterial ref={material} vertexShader={particleVertexShader} fragmentShader={particleFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uScroll: { value: 0 }, uVelocity: { value: 0 } }} /></points>;
}

const planetVertexShader = `varying vec3 vNormal;varying vec3 vWorldPosition;void main(){vNormal=normalize(normalMatrix*normal);vec4 world=modelMatrix*vec4(position,1.);vWorldPosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const planetFragmentShader = `uniform float uTime;uniform vec3 uBase;uniform float uType;varying vec3 vNormal;varying vec3 vWorldPosition;float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec3(1,0,0)),c=hash(i+vec3(0,1,0)),d=hash(i+vec3(1,1,0)),e=hash(i+vec3(0,0,1)),f1=hash(i+vec3(1,0,1)),g=hash(i+vec3(0,1,1)),h=hash(i+vec3(1,1,1));return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,f1,f.x),mix(g,h,f.x),f.y),f.z);}float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p*=2.03;a*=.5;}return v;}void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.65,.3,1.35));float diffuse=max(dot(n,light),0.);float rim=pow(1.-max(dot(n,vec3(0,0,1)),0.),2.8);vec3 c=uBase;vec3 q=normalize(vWorldPosition);if(uType<.5){float rock=fbm(q*8.),crater=fbm(q*18.);c*=mix(.58,1.12,rock);c*=1.-smoothstep(.62,.8,crater)*.12;}else if(uType<1.5){float cloud=fbm(q*5.);c=mix(c,c*vec3(1.3,.9,.6),smoothstep(.43,.72,cloud));}else if(uType<2.5){float land=fbm(q*2.8+vec3(2.1,0,0));float detail=fbm(q*10.);vec3 ocean=vec3(.012,.12,.34);vec3 landC=mix(vec3(.06,.19,.06),vec3(.42,.48,.18),detail);c=mix(ocean,landC,smoothstep(.5,.6,land));float clouds=fbm(q*12.+vec3(0,uTime*.015,0));c=mix(c,vec3(.9,.94,.96),smoothstep(.66,.78,clouds)*.62);}else if(uType<3.5){float bands=sin((q.y+fbm(q*3.)*.2)*24.);c*=mix(.68,1.18,bands*.5+.5);c=mix(c,c*vec3(1.16,.86,.65),smoothstep(.52,.82,fbm(q*6.)));}else if(uType<4.5){float bands=sin((q.y+fbm(q*5.)*.12)*34.);c*=mix(.72,1.14,bands*.5+.5);}else if(uType<5.5){c*=mix(.8,1.08,fbm(q*5.));}else{float bands=sin((q.y+fbm(q*3.)*.15)*27.);c*=mix(.64,1.14,bands*.5+.5);}float wrap=smoothstep(-.1,.62,diffuse);vec3 shaded=c*(.055+.96*wrap);float spec=pow(max(dot(reflect(-light,n),vec3(0,0,1)),0.),54.);shaded+=vec3(.45,.62,.9)*spec*.2;shaded+=vec3(.015,.16,.28)*rim*.12;gl_FragColor=vec4(shaded,1.);}`;

function PlanetAtmosphere({ size }: { size: number }) { return <mesh scale={size * 1.05}><sphereGeometry args={[1,48,32]} /><meshBasicMaterial color="#65dff0" transparent opacity={.075} blending={THREE.AdditiveBlending} side={THREE.BackSide} /></mesh>; }

const PLANETS = [
  { name:'Mercury', base:'#8b857d', size:.095, distance:.72, speed:1.8, phase:.2, type:0 },
  { name:'Venus', base:'#c7955c', size:.13, distance:1.04, speed:1.35, phase:1.5, type:1 },
  { name:'Earth', base:'#3d8fc7', size:.36, distance:1.42, speed:1.05, phase:2.5, type:2, earth:true },
  { name:'Mars', base:'#b95b42', size:.12, distance:1.78, speed:.82, phase:3.7, type:0 },
  { name:'Jupiter', base:'#b99770', size:.25, distance:2.2, speed:.55, phase:4.5, type:3 },
  { name:'Saturn', base:'#c8b27e', size:.23, distance:2.68, speed:.42, phase:5.3, type:4, ring:true },
  { name:'Uranus', base:'#79c1c6', size:.17, distance:3.12, speed:.32, phase:.9, type:5 },
  { name:'Neptune', base:'#426dc0', size:.17, distance:3.52, speed:.26, phase:2.2, type:6 },
] as const;

function Planet({ data, motion, index }: { data: typeof PLANETS[number]; motion: MotionRef; index: number }) {
  const group = useRef<THREE.Group>(null); const material = useRef<THREE.ShaderMaterial>(null); const pointer = useRef(new THREE.Vector2()); const target = useRef(new THREE.Vector2());
  useEffect(() => { const move = (e: PointerEvent) => target.current.set(e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); window.addEventListener('pointermove', move, { passive:true }); return () => window.removeEventListener('pointermove', move); }, []);
  useFrame(({ clock }) => { if (!group.current) return; const t=clock.getElapsedTime(),p=motion.current.progress; pointer.current.lerp(target.current,.04); const reveal=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.07)/.5,0,1),0,1); const spread=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.16)/.22,0,1),0,1); const angle=data.phase+t*data.speed*.045+p*(index%2?1.1:-.75); const x=Math.cos(angle)*data.distance; const y=Math.sin(angle*.72)*data.distance*.2; const z=-1.9-data.distance*.18+Math.sin(angle)*.32; const heroX=index===2?.82:0; const heroY=index===2?.04:0; const visibleScale=index===2?1.62:.001; const scrollScale=THREE.MathUtils.lerp(1,.78,spread); group.current.position.x=THREE.MathUtils.lerp(group.current.position.x,THREE.MathUtils.lerp(heroX,x,spread)+pointer.current.x*(.045+index*.004),.065); group.current.position.y=THREE.MathUtils.lerp(group.current.position.y,THREE.MathUtils.lerp(heroY,y,spread)+pointer.current.y*(.035+index*.003),.065); group.current.position.z=THREE.MathUtils.lerp(group.current.position.z,z,.065); group.current.scale.setScalar(THREE.MathUtils.lerp(visibleScale,scrollScale,reveal)); group.current.rotation.y+=.0025+data.speed*.0008; group.current.rotation.x=pointer.current.y*.025; if(material.current)material.current.uniforms.uTime.value=t; });
  return <group ref={group}><mesh><sphereGeometry args={[data.size,64,40]} /><shaderMaterial ref={material} vertexShader={planetVertexShader} fragmentShader={planetFragmentShader} uniforms={{uTime:{value:0},uBase:{value:new THREE.Color(data.base)},uType:{value:data.type}}} /></mesh>{data.earth&&<PlanetAtmosphere size={data.size}/>} {data.earth&&<mesh position={[data.size*1.4,.015,.02]}><sphereGeometry args={[.045,20,14]}/><meshStandardMaterial color="#a7a49b" roughness={1}/></mesh>} {data.ring&&<group rotation={[Math.PI/2.45,.16,.08]}><mesh><ringGeometry args={[data.size*1.35,data.size*2.15,96]}/><meshStandardMaterial color="#b7a57d" roughness={.92} transparent opacity={.7} side={THREE.DoubleSide}/></mesh></group>}</group>;
}

function Sun() { const material=useRef<THREE.ShaderMaterial>(null); useFrame(({clock})=>{if(material.current)material.current.uniforms.uTime.value=clock.getElapsedTime()}); const vertex=`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`; const fragment=`uniform float uTime;varying vec3 vP;float n(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}void main(){float v=n(vP*8.+uTime*.06);vec3 c=mix(vec3(1.,.28,.02),vec3(1.,.82,.3),v);gl_FragColor=vec4(c*1.25,1.);}`; return <group><pointLight position={[0,0,1]} intensity={2.4} distance={9} color="#ffd18b"/><mesh><sphereGeometry args={[.2,48,32]}/><shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={{uTime:{value:0}}}/></mesh><mesh scale={1.5}><sphereGeometry args={[.2,32,20]}/><meshBasicMaterial color="#ff9f38" transparent opacity={.1} blending={THREE.AdditiveBlending}/></mesh></group>; }

function SolarSystem({ motion }: { motion: MotionRef }) { const system=useRef<THREE.Group>(null); const pointer=useRef(new THREE.Vector2()); const target=useRef(new THREE.Vector2()); useEffect(()=>{const move=(e:PointerEvent)=>target.current.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1);window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]); useFrame(({clock})=>{if(!system.current)return;const p=motion.current.progress;pointer.current.lerp(target.current,.04);const orbit=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.13)/.25,0,1),0,1);const late=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.28)/.28,0,1),0,1);system.current.position.x=THREE.MathUtils.lerp(.98+pointer.current.x*.04,.18+pointer.current.x*.1,orbit)+late*.48;system.current.position.y=THREE.MathUtils.lerp(.03+pointer.current.y*.03,.06+pointer.current.y*.08,orbit);system.current.position.z=-.12;system.current.scale.setScalar(THREE.MathUtils.lerp(1,.72,late));system.current.rotation.z=Math.sin(clock.getElapsedTime()*.07)*.008;}); return <group ref={system}><Sun/>{PLANETS.map((planet,index)=><Planet key={planet.name} data={planet} motion={motion} index={index}/>)}<OrbitGuides motion={motion}/></group>; }
function OrbitGuides({ motion }: { motion: MotionRef }) { const group=useRef<THREE.Group>(null); useFrame(()=>{if(!group.current)return;const p=motion.current.progress;const reveal=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.18)/.28,0,1),0,1);group.current.scale.setScalar(reveal);group.current.position.x=.12;}); return <group ref={group}>{PLANETS.map(p=><mesh key={p.name} rotation={[Math.PI/2,0,0]}><torusGeometry args={[p.distance,.0015,4,128]}/><meshBasicMaterial color="#9fe9e1" transparent opacity={.022}/></mesh>)}</group>; }
function Scene(){const motion=useScrollMotion();return <><Atmosphere motion={motion}/><SolarSystem motion={motion}/><ProjectScene/></>}
export default function AICoreScene(){return <Canvas camera={{position:[0,0,4.55],fov:36}} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}><ambientLight intensity={.28} color="#d8e8ff"/><Scene/></Canvas>}
