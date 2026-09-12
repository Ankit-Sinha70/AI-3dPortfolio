import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader=`uniform float uTime;uniform float uReveal;attribute float aSize;attribute float aSeed;varying float vAlpha;void main(){vec3 p=position;float drift=uTime*(.018+aSeed*.025);p.x+=sin(drift+aSeed*19.)*.18;p.y+=cos(drift*1.3+aSeed*11.)*.14;p.z+=sin(drift*.8+aSeed*7.)*.16;p*=1.+uReveal*.35;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*(125./max(1.,-mv.z));gl_Position=projectionMatrix*mv;vAlpha=(.15+.65*aSeed)*uReveal;}`;
const fragmentShader=`varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float glow=smoothstep(.5,0.,d);vec3 c=mix(vec3(.25,.95,.84),vec3(.52,.42,1.),glow*.75);gl_FragColor=vec4(c,glow*vAlpha*.28);}`;

export default function AmbientUniverse(){
  const material=useRef<THREE.ShaderMaterial>(null);const progress=useRef(0);
  const {positions,sizes,seeds}=useMemo(()=>{const count=340,p=new Float32Array(count*3),s=new Float32Array(count),r=new Float32Array(count);for(let i=0;i<count;i+=1){const radius=3.2+Math.random()*3.8,theta=Math.random()*Math.PI*2;p[i*3]=Math.cos(theta)*radius+(Math.random()-.5)*2;p[i*3+1]=(Math.random()-.5)*5.2;p[i*3+2]=Math.sin(theta)*radius-1;s[i]=.35+Math.random()*1.25;r[i]=Math.random();}return{positions:p,sizes:s,seeds:r};},[]);
  useEffect(()=>{const update=()=>{progress.current=THREE.MathUtils.clamp(window.scrollY/Math.max(document.documentElement.scrollHeight-window.innerHeight,1),0,1)};window.addEventListener('scroll',update,{passive:true});update();return()=>window.removeEventListener('scroll',update)},[]);
  useFrame(({clock})=>{if(!material.current)return;const reveal=THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((progress.current-.68)/.25,0,1),0,1);material.current.uniforms.uTime.value=clock.getElapsedTime();material.current.uniforms.uReveal.value=reveal});
  return <points position={[0,0,-1.4]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-aSize" args={[sizes,1]}/><bufferAttribute attach="attributes-aSeed" args={[seeds,1]}/></bufferGeometry><shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={{uTime:{value:0},uReveal:{value:0}}}/></points>;
}
