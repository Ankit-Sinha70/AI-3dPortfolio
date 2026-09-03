import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const coreVertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDisplacement;
float hash(vec3 p){p=fract(p*0.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 p=position,n=normalize(position);float organic=noise(n*3.2+uTime*.18);float ripple=sin(p.y*5.+uTime*.9)*.018;float pulse=sin(uTime*1.15)*.018;float displacement=(organic-.5)*(.16+abs(uVelocity)*.08)+ripple+pulse+uScroll*.08;p+=n*displacement;vDisplacement=displacement;vNormal=normalize(normalMatrix*n);vec4 world=modelMatrix*vec4(p,1.);vWorldPosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;

const coreFragmentShader = `
uniform float uTime;
uniform float uVelocity;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vDisplacement;
void main(){vec3 cyan=vec3(.369,.918,.831),violet=vec3(.42,.32,.95),warm=vec3(1.,.78,.48);vec3 viewDir=normalize(cameraPosition-vWorldPosition);float fresnel=pow(1.-max(dot(normalize(vNormal),viewDir),0.),2.4);float latitude=.5+.5*sin(vWorldPosition.y*7.-uTime*1.1+uVelocity*2.);float energy=smoothstep(.02,.12,abs(vDisplacement));float scan=smoothstep(.46,.5,.5+.5*sin(vWorldPosition.y*15.-uTime*(2.2+abs(uVelocity)*2.)));vec3 color=mix(cyan,violet,latitude*.7);color=mix(color,warm,fresnel*.45);color+=cyan*fresnel*(1.9+abs(uVelocity)*.8);color+=violet*energy*.55; color+=warm*scan*fresnel*.35;gl_FragColor=vec4(color,.48+fresnel*.46);}`;

const particleVertexShader = `
uniform float uTime;uniform float uPixelRatio;uniform float uScroll;uniform float uVelocity;attribute float aSize;attribute float aSeed;varying float vSeed;
void main(){vec3 p=position;float t=uTime*(.08+aSeed*.08);float motion=1.+abs(uVelocity)*1.8;p.x+=sin(t+aSeed*12.)*.08*motion;p.y+=cos(t*1.2+aSeed*8.)*.08*motion-uScroll*.32;p.z+=sin(t*.7+aSeed*5.)*.06*motion;vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*uPixelRatio*(150./max(1.,-mvPosition.z));gl_Position=projectionMatrix*mvPosition;vSeed=aSeed;}`;
const particleFragmentShader = `varying float vSeed;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv),glow=smoothstep(.5,0.,d);vec3 color=mix(vec3(.369,.918,.831),vec3(.55,.42,1.),fract(vSeed*5.));gl_FragColor=vec4(color,glow*.34);}`;

function useScrollMotion() {
  const state = useRef({ progress: 0, velocity: 0, targetVelocity: 0, lastY: 0, lastTime: 0 });
  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(now - state.current.lastTime, 16);
      state.current.targetVelocity = THREE.MathUtils.clamp((y - state.current.lastY) / dt * 0.045, -1, 1);
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

function Atmosphere({ motion }) {
  const material = useRef(null);
  const { positions, sizes, seeds } = useMemo(() => {
    const count=520, positions=new Float32Array(count*3), sizes=new Float32Array(count), seeds=new Float32Array(count);
    for(let i=0;i<count;i+=1){const r=2+Math.random()*3.8,t=Math.random()*Math.PI*2;positions[i*3]=Math.cos(t)*r+(Math.random()-.5)*1.3;positions[i*3+1]=(Math.random()-.5)*3.4;positions[i*3+2]=Math.sin(t)*r;sizes[i]=.7+Math.random()*1.8;seeds[i]=Math.random();}
    return {positions,sizes,seeds};
  }, []);
  useFrame(({clock,gl})=>{if(!material.current)return;material.current.uniforms.uTime.value=clock.getElapsedTime();material.current.uniforms.uScroll.value=motion.current.progress;material.current.uniforms.uVelocity.value=motion.current.velocity;material.current.uniforms.uPixelRatio.value=Math.min(gl.getPixelRatio(),1.5);motion.current.velocity=THREE.MathUtils.lerp(motion.current.velocity,motion.current.targetVelocity,.08);motion.current.targetVelocity*=.9;});
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-aSize" args={[sizes,1]}/><bufferAttribute attach="attributes-aSeed" args={[seeds,1]}/></bufferGeometry><shaderMaterial ref={material} vertexShader={particleVertexShader} fragmentShader={particleFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{uTime:{value:0},uPixelRatio:{value:1},uScroll:{value:0},uVelocity:{value:0}}}/></points>;
}

function Core({ motion }) {
  const material=useRef(null),group=useRef(null),pointer=useRef(new THREE.Vector2()),targetPointer=useRef(new THREE.Vector2());
  const uniforms=useMemo(()=>({uTime:{value:0},uScroll:{value:0},uVelocity:{value:0}}),[]);
  useEffect(()=>{const move=e=>{targetPointer.current.x=e.clientX/window.innerWidth*2-1;targetPointer.current.y=-(e.clientY/window.innerHeight)*2+1;};window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move);},[]);
  useFrame(({clock,camera})=>{const t=clock.getElapsedTime();pointer.current.lerp(targetPointer.current,.045);const p=motion.current.progress,v=motion.current.velocity;if(material.current){material.current.uniforms.uTime.value=t;material.current.uniforms.uScroll.value=p;material.current.uniforms.uVelocity.value=v;}if(group.current){group.current.rotation.y=t*.12+pointer.current.x*.22+v*.12;group.current.rotation.x=Math.sin(t*.22)*.08+pointer.current.y*.12-v*.08;group.current.position.y=pointer.current.y*.12-p*.35;group.current.position.x=THREE.MathUtils.lerp(0,-1.05,p);group.current.position.z=THREE.MathUtils.lerp(0,-.9,p);group.current.scale.setScalar(THREE.MathUtils.lerp(1,.72,p));}camera.position.x=THREE.MathUtils.lerp(camera.position.x,pointer.current.x*.12+v*.08,.045);camera.position.y=THREE.MathUtils.lerp(camera.position.y,pointer.current.y*.08,.045);camera.position.z=THREE.MathUtils.lerp(camera.position.z,5.2+p*.9,.035);camera.lookAt(THREE.MathUtils.lerp(0,-.25,p),0,0);});
  return <group ref={group}><mesh><icosahedronGeometry args={[1.35,5]}/><shaderMaterial ref={material} vertexShader={coreVertexShader} fragmentShader={coreFragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={uniforms}/></mesh><mesh scale={1.045}><icosahedronGeometry args={[1.35,3]}/><meshBasicMaterial color="#5eead4" wireframe transparent opacity={.16} depthWrite={false}/></mesh><mesh scale={1.105} rotation={[.35,.2,0]}><icosahedronGeometry args={[1.35,2]}/><meshBasicMaterial color="#8b7cff" wireframe transparent opacity={.09} depthWrite={false}/></mesh><mesh scale={1.19} rotation={[0,.7,.4]}><icosahedronGeometry args={[1.35,1]}/><meshBasicMaterial color="#ffd9a0" wireframe transparent opacity={.055} depthWrite={false}/></mesh></group>;
}

function EnergyRings({ motion }) { const group=useRef(null); useFrame(({clock})=>{if(!group.current)return;const t=clock.getElapsedTime(),p=motion.current.progress,v=motion.current.velocity;group.current.rotation.z=t*.06+v*.45;group.current.rotation.x=Math.sin(t*.16)*.08+v*.12;group.current.position.x=THREE.MathUtils.lerp(0,-1.05,p);group.current.position.z=THREE.MathUtils.lerp(0,-.9,p);group.current.scale.setScalar(THREE.MathUtils.lerp(1,.72,p)+Math.abs(v)*.05);}); return <group ref={group}><mesh rotation={[Math.PI/2,.12,0]}><torusGeometry args={[1.68,.008,8,96]}/><meshBasicMaterial color="#5eead4" transparent opacity={.26} blending={THREE.AdditiveBlending}/></mesh><mesh rotation={[1.1,-.42,0]}><torusGeometry args={[1.9,.006,8,96]}/><meshBasicMaterial color="#8b7cff" transparent opacity={.18} blending={THREE.AdditiveBlending}/></mesh><mesh rotation={[.25,.8,1.1]}><torusGeometry args={[2.12,.004,8,96]}/><meshBasicMaterial color="#ffd9a0" transparent opacity={.12} blending={THREE.AdditiveBlending}/></mesh></group>; }

function Scene(){const motion=useScrollMotion();return <><Atmosphere motion={motion}/><EnergyRings motion={motion}/><Core motion={motion}/></>;}
export default function AICoreScene(){return <Canvas camera={{position:[0,0,5.2],fov:42}} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}><Scene/></Canvas>;}
