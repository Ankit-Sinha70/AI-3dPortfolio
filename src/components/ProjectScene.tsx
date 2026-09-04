import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PROJECTS = ['aurora', 'echo', 'ledger', 'drift', 'halo'];

type SceneState = { active: number; workProgress: number; visible: boolean };

function useProjectState() {
  const state = useRef<SceneState>({ active: 0, workProgress: 0, visible: false });

  useMemo(() => {
    const update = () => {
      const section = document.querySelector('.work');
      const cards = Array.from(document.querySelectorAll('.work .card'));
      if (!section || !cards.length) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      state.current.visible = rect.top < vh * 0.9 && rect.bottom > vh * 0.1;
      state.current.workProgress = THREE.MathUtils.clamp((vh * 0.82 - rect.top) / Math.max(rect.height - vh * 0.64, 1), 0, 1);

      let closest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.top + r.height * 0.5 - vh * 0.5);
        if (d < distance) {
          distance = d;
          closest = index;
        }
      });
      state.current.active = Math.min(closest, PROJECTS.length - 1);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return state;
}

function AuroraArtifact({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.x = Math.sin(t * 0.45) * 0.16;
    group.current.rotation.y = t * 0.22;
    group.current.rotation.z = Math.cos(t * 0.3) * 0.08;
  });
  return <group ref={group}>
    <mesh><icosahedronGeometry args={[1.15, 2]} /><meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.38 * intensity} /></mesh>
    <mesh scale={0.72}><icosahedronGeometry args={[1.15, 3]} /><meshBasicMaterial color="#8b7cff" wireframe transparent opacity={0.28 * intensity} /></mesh>
    <mesh scale={1.28}><torusGeometry args={[1, 0.018, 8, 80]} /><meshBasicMaterial color="#ffd9a0" transparent opacity={0.5 * intensity} /></mesh>
  </group>;
}

function EchoArtifact({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => Array.from({ length: 70 }, (_, i) => {
    const x = (i / 69 - 0.5) * 3.2;
    return new THREE.Vector3(x, Math.sin(i * 0.42) * 0.34, Math.cos(i * 0.25) * 0.1);
  }), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.4) * 0.2;
    group.current.rotation.z = t * 0.08;
    group.current.children.forEach((child, i) => { child.position.y = Math.sin(t * 2 + i * 0.42) * 0.08; });
  });
  return <group ref={group}>{points.map((p, i) => <mesh key={i} position={[p.x, p.y, p.z]}><sphereGeometry args={[0.022 + (i % 5) * 0.006, 8, 8]} /><meshBasicMaterial color="#5eead4" transparent opacity={0.22 * intensity + (i % 7 === 0 ? 0.28 : 0)} /></mesh>)}</group>;
}

function LedgerArtifact({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.35) * 0.22;
    group.current.rotation.x = -0.16 + Math.sin(t * 0.25) * 0.04;
  });
  return <group ref={group}>{Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[(i % 2) * 0.07, (i - 3) * 0.18, i * 0.055]} rotation={[0, 0, (i - 3) * 0.025]}><planeGeometry args={[2.2 - i * 0.1, 1.3]} /><meshBasicMaterial color={i % 2 ? '#8b7cff' : '#5eead4'} transparent opacity={(0.08 + i * 0.018) * intensity} side={THREE.DoubleSide} /></mesh>)}</group>;
}

function DriftArtifact({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => Array.from({ length: 9 }, (_, i) => new THREE.Vector3((i % 3 - 1) * 0.8, (Math.floor(i / 3) - 1) * 0.65, (i % 2) * 0.22)), []);
  useFrame(({ clock }) => { if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.12; });
  return <group ref={group}>{nodes.map((p, i) => <mesh key={i} position={p}><icosahedronGeometry args={[0.11, 1]} /><meshBasicMaterial color={i % 3 === 0 ? '#ffd9a0' : '#5eead4'} transparent opacity={0.55 * intensity} /></mesh>)}</group>;
}

function HaloArtifact({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (group.current) { const t = clock.getElapsedTime(); group.current.rotation.y = t * 0.18; group.current.rotation.x = Math.sin(t * 0.3) * 0.12; } });
  return <group ref={group}>{[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[i * 0.45, i * 0.7, i * 0.32]}><torusGeometry args={[0.72 + i * 0.2, 0.012, 8, 96]} /><meshBasicMaterial color={i % 2 ? '#8b7cff' : '#5eead4'} transparent opacity={(0.18 + i * 0.04) * intensity} blending={THREE.AdditiveBlending} /></mesh>)}</group>;
}

function Artifact({ index, intensity }: { index: number; intensity: number }) {
  if (index === 0) return <AuroraArtifact intensity={intensity} />;
  if (index === 1) return <EchoArtifact intensity={intensity} />;
  if (index === 2) return <LedgerArtifact intensity={intensity} />;
  if (index === 3) return <DriftArtifact intensity={intensity} />;
  return <HaloArtifact intensity={intensity} />;
}

export default function ProjectScene() {
  const state = useProjectState();
  const groups = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groups.current) return;
    const { active, visible } = state.current;
    groups.current.children.forEach((child, index) => {
      const distance = Math.abs(index - active);
      const targetX = (index - active) * 3.8 + 1.25;
      const targetY = index === active ? 0.15 : (index - active) * 0.32;
      const targetZ = index === active ? 0 : -1.4 - distance * 0.8;
      const targetScale = index === active ? 1.15 : 0.5;
      const targetOpacity = visible ? Math.max(0, 1 - distance * 0.55) : 0;
      child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, 0.055);
      child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.055);
      child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, 0.055);
      child.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.055);
      child.userData.targetOpacity = targetOpacity;
      child.traverse((object) => {
        const material = (object as THREE.Mesh).material as THREE.Material & { opacity?: number; transparent?: boolean };
        if (material?.opacity !== undefined) {
          material.transparent = true;
          material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.08);
        }
      });
    });
  });

  return <group ref={groups}>
    {PROJECTS.map((_, index) => <group key={_}><Artifact index={index} intensity={1} /></group>)}
  </group>;
}
