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
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(now - state.current.lastTime, 16);
      state.current.targetVelocity = THREE.MathUtils.clamp(((y - state.current.lastY) / dt) * 0.045, -1, 1);
      state.current.lastY = y;
      state.current.lastTime = now;
      state.current.progress = THREE.MathUtils.clamp(y / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 0, 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
}

const particleVertexShader = `uniform float uTime;uniform float uPixelRatio;uniform float uScroll;uniform float uVelocity;attribute float aSize;attribute float aSeed;varying float vSeed;void main(){vec3 p=position;float t=uTime*(.08+aSeed*.08);float motion=1.+abs(uVelocity)*1.8;p.x+=sin(t+aSeed*12.)*.08*motion;p.y+=cos(t*1.2+aSeed*8.)*.08*motion-uScroll*.32;p.z+=sin(t*.7+aSeed*5.)*.06*motion;vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*uPixelRatio*(150./max(1.,-mvPosition.z));gl_Position=projectionMatrix*mvPosition;vSeed=aSeed;}`;
const particleFragmentShader = `varying float vSeed;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv),glow=smoothstep(.5,0.,d);vec3 color=mix(vec3(.369,.918,.831),vec3(.55,.42,1.),fract(vSeed*5.));gl_FragColor=vec4(color,glow*.34);}`;

function Atmosphere({ motion }: { motion: MotionRef }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { positions, sizes, seeds } = useMemo(() => {
    const count=520, positions=new Float32Array(count*3), sizes=new Float32Array(count), seeds=new Float32Array(count);
    for(let i=0;i<count;i++){const r=2+Math.random()*3.8,t=Math.random()*Math.PI*2;positions[i*3]=Math.cos(t)*r+(Math.random()-.5)*1.3;positions[i*3+1]=(Math.random()-.5)*3.4;positions[i*3+2]=Math.sin(t)*r;sizes[i]=.7+Math.random()*1.8;seeds[i]=Math.random();}
    return {positions,sizes,seeds};
  },[]);
  useFrame(({clock,gl})=>{if(!material.current)return;material.current.uniforms.uTime.value=clock.getElapsedTime();material.current.uniforms.uScroll.value=motion.current.progress;material.current.uniforms.uVelocity.value=motion.current.velocity;material.current.uniforms.uPixelRatio.value=Math.min(gl.getPixelRatio(),1.5);motion.current.velocity=THREE.MathUtils.lerp(motion.current.velocity,motion.current.targetVelocity,.08);motion.current.targetVelocity*=.9;});
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-aSize" args={[sizes,1]}/><bufferAttribute attach="attributes-aSeed" args={[seeds,1]}/></bufferGeometry><shaderMaterial ref={material} vertexShader={particleVertexShader} fragmentShader={particleFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{uTime:{value:0},uPixelRatio:{value:1},uScroll:{value:0},uVelocity:{value:0}}}/></points>;
}

const planetVertexShader=`varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorldPosition;void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);vec4 world=modelMatrix*vec4(position,1.);vWorldPosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const planetFragmentShader=`uniform float uTime;uniform vec3 uBase;uniform float uType;varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorldPosition;
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec3(1,0,0)),c=hash(i+vec3(0,1,0)),d=hash(i+vec3(1,1,0)),e=hash(i+vec3(0,0,1)),f1=hash(i+vec3(1,0,1)),g=hash(i+vec3(0,1,1)),h=hash(i+vec3(1,1,1));return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,f1,f.x),mix(g,h,f.x),f.y),f.z);}float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p*=2.03;a*=.5;}return v;}
void main(){vec3 n=normalize(vNormal),light=normalize(vec3(-.62,.28,1.2));float diffuse=max(dot(n,light),0.),view=max(dot(n,vec3(0,0,1)),0.),rim=pow(1.-view,3.0);vec3 q=normalize(vWorldPosition),c=uBase;
if(uType<.5){float terrain=fbm(q*8.),craters=fbm(q*17.);c*=mix(.62,1.12,terrain);c-=smoothstep(.63,.8,craters)*.13;}
else if(uType<1.5){float cloud=fbm(q*4.0);c=mix(c,c*vec3(1.25,.88,.58),smoothstep(.42,.75,cloud));}
else if(uType<2.5){float land=fbm(q*2.7+vec3(2.1,0,0)),detail=fbm(q*9.);vec3 ocean=vec3(.018,.16,.42),landC=mix(vec3(.08,.22,.08),vec3(.40,.48,.19),detail);c=mix(ocean,landC,smoothstep(.49,.59,land));float clouds=fbm(q*11.+vec3(0,uTime*.012,0));c=mix(c,vec3(.92,.94,.94),smoothstep(.66,.77,clouds)*.7);}
else if(uType<3.5){float bands=sin((q.y+fbm(q*3.)*.2)*24.);c*=mix(.68,1.2,bands*.5+.5);c=mix(c,c*vec3(1.18,.84,.62),smoothstep(.55,.85,fbm(q*6.)));}
else if(uType<4.5){float bands=sin((q.y+fbm(q*5.)*.12)*34.);c*=mix(.72,1.15,bands*.5+.5);}
else if(uType<5.5){c*=mix(.82,1.08,fbm(q*5.));}
else{float bands=sin((q.y+fbm(q*3.)*.15)*27.);c*=mix(.64,1.16,bands*.5+.5);}
float lightWrap=smoothstep(-.15,.55,diffuse);vec3 shaded=c*(.08+.96*lightWrap);float spec=pow(max(dot(reflect(-light,n),vec3(0,0,1)),0.),48.);shaded+=vec3(.48,.68,.92)*spec*.22;shaded+=vec3(.02,.22,.36)*rim*.16;gl_FragColor=vec4(shaded,1.);}`;

function PlanetAtmosphere({size}:{size:number}){return <mesh scale={size*1.045}><sphereGeometry args={[1,48,32]}/><meshBasicMaterial color="#5edcf0" transparent opacity={.09} blending={THREE.AdditiveBlending} side={THREE.BackSide}/></mesh>}

const PLANETS=[
{name:'Mercury',base:'#89837c',size:.12,distance:.72,speed:1.8,phase:.2,type:0},
{name:'Venus',base:'#c98f55',size:.18,distance:1.05,speed:1.35,phase:1.5,type:1},
{name:'Earth',base:'#3f91c9',size:.38,distance:1.4,speed:1.05,phase:2.5,type:2,earth:true},
{name:'Mars',base:'#b8583e',size:.17,distance:1.75,speed:.82,phase:3.7,type:0},
{name:'Jupiter',base:'#b7956e',size:.38,distance:2.2,speed:.55,phase:4.5,type:3},
{name:'Saturn',base:'#cbbb8d',size:.33,distance:2.7,speed:.42,phase:5.3,type:4,ring:true},
{name:'Uranus',base:'#82c6c9',size:.27,distance:3.15,speed:.32,phase:.9,type:5},
{name:'Neptune',base:'#456fc0',size:.26,distance:3.55,speed:.26,phase:2.2,type:6},
] as const;

function Planet({data,motion,index}:{data:typeof PLANETS[number];motion:MotionRef;index:number}){
  const group=useRef<THREE.Group>(null),material=useRef<THREE.ShaderMaterial>(null),pointer=useRef(new THREE.Vector2()),target=useRef(new THREE.Vector2());
  useEffect(()=>{const move=(e:PointerEvent)=>target.current.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1);window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]);
  useFrame(({clock})=>{if(!group.current)return;const t=clock.getElapsedTime(),p=motion.current.progress;pointer.current.lerp(target.current,.035);const reveal=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.05)/.58,0,1),0,1);const angle=data.phase+t*data.speed*.055+p*(index%2?1.1:-.75);const x=Math.cos(angle)*data.distance*reveal,y=Math.sin(angle*.72)*data.distance*.2*reveal,z=-1.72-data.distance*.2+Math.sin(angle)*.52;const heroX=index===2?1.02:0,heroY=index===2?.05:0;group.current.position.x=THREE.MathUtils.lerp(group.current.position.x,THREE.MathUtils.lerp(heroX,x,reveal)+pointer.current.x*(.05+index*.005),.055);group.current.position.y=THREE.MathUtils.lerp(group.current.position.y,THREE.MathUtils.lerp(heroY,y,reveal)+pointer.current.y*(.04+index*.004),.055);group.current.position.z=THREE.MathUtils.lerp(group.current.position.z,z,.055);group.current.scale.setScalar(THREE.MathUtils.lerp(index===2?1.72:.001,1,reveal));group.current.rotation.y+=.0028+data.speed*.001;group.current.rotation.x=pointer.current.y*.03;if(material.current)material.current.uniforms.uTime.value=t;});
  return <group ref={group}><mesh><sphereGeometry args={[data.size,64,40]}/><shaderMaterial ref={material} vertexShader={planetVertexShader} fragmentShader={planetFragmentShader} uniforms={{uTime:{value:0},uBase:{value:new THREE.Color(data.base)},uType:{value:data.type}}}/></mesh>{data.earth&&<PlanetAtmosphere size={data.size}/>} {data.earth&&<mesh position={[data.size*1.42,.015,.02]}><sphereGeometry args={[.064,24,16]}/><meshStandardMaterial color="#aaa69c" roughness={1}/></mesh>}{data.ring&&<group rotation={[Math.PI/2.45,.16,.08]}><mesh><ringGeometry args={[data.size*1.35,data.size*2.15,96]}/><meshStandardMaterial color="#b9a77f" roughness={.9} transparent opacity={.76} side={THREE.DoubleSide}/></mesh><mesh scale={1.16}><ringGeometry args={[data.size*1.56,data.size*1.72,96]}/><meshStandardMaterial color="#756b57" roughness={1} transparent opacity={.25} side={THREE.DoubleSide}/></mesh></group>}</group>
}

function Sun(){const material=useRef<THREE.ShaderMaterial>(null);useFrame(({clock})=>{if(material.current)material.current.uniforms.uTime.value=clock.getElapsedTime()});const vertex=`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;const fragment=`uniform float uTime;varying vec3 vP;float n(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}void main(){float v=n(vP*7.+uTime*.08);vec3 c=mix(vec3(1.,.18,.015),vec3(1.,.82,.22),v);gl_FragColor=vec4(c*1.4,1.);}`;return <group><pointLight position={[0,0,1]} intensity={3.6} distance={10} color="#ffd18b"/><mesh><sphereGeometry args={[.27,48,32]}/><shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={{uTime:{value:0}}}/></mesh><mesh scale={1.42}><sphereGeometry args={[.27,32,20]}/><meshBasicMaterial color="#ff9f38" transparent opacity={.13} blending={THREE.AdditiveBlending}/></mesh></group>}

function SolarSystem({motion}:{motion:MotionRef}){const system=useRef<THREE.Group>(null),pointer=useRef(new THREE.Vector2()),target=useRef(new THREE.Vector2());useEffect(()=>{const move=(e:PointerEvent)=>target.current.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1);window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]);useFrame(()=>{if(!system.current)return;const p=motion.current.progress;pointer.current.lerp(target.current,.04);const reveal=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p-.05)/.58,0,1),0,1);system.current.position.x=THREE.MathUtils.lerp(1.0+pointer.current.x*.06,pointer.current.x*.16,reveal);system.current.position.y=THREE.MathUtils.lerp(.02+pointer.current.y*.04,pointer.current.y*.1,reveal);system.current.rotation.z=Math.sin(performance.now()*.00008)*.012});return <group ref={system}><Sun/>{PLANETS.map((planet,index)=><Planet key={planet.name} data={planet} motion={motion} index={index}/>)}<OrbitGuides motion={motion}/></group>}
function OrbitGuides({motion}:{motion:MotionRef}){const group=useRef<THREE.Group>(null);useFrame(()=>{if(!group.current)return;const r=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((motion.current.progress-.12)/.46,0,1),0,1);group.current.scale.setScalar(r)});return <group ref={group}>{PLANETS.map(p=><mesh key={p.name} rotation={[Math.PI/2,0,0]}><torusGeometry args={[p.distance,.002,4,128]}/><meshBasicMaterial color="#9fe9e1" transparent opacity={.032}/></mesh>)}</group>}
function Scene(){const motion=useScrollMotion();return <><Atmosphere motion={motion}/><SolarSystem motion={motion}/><ProjectScene/></>}
export default function AICoreScene(){return <Canvas camera={{position:[0,0,4.35],fov:34}} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}><ambientLight intensity={.2} color="#d8e8ff"/><Scene/></Canvas>}
