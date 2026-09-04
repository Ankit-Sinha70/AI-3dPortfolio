import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PROJECTS = ['aurora', 'echo', 'ledger', 'drift', 'halo'];
type SceneState = { active: number; progress: number; visible: boolean };

function useProjectState() {
  const state = useRef<SceneState>({ active: 0, progress: 0, visible: false });
  useEffect(() => {
    const update = () => {
      const section = document.querySelector('.work');
      const cards = Array.from(document.querySelectorAll('.work .card'));
      if (!section || !cards.length) return;
      const rect = section.getBoundingClientRect(); const vh = window.innerHeight;
      state.current.visible = rect.top < vh * 0.95 && rect.bottom > vh * 0.05;
      state.current.progress = THREE.MathUtils.clamp((vh * 0.85 - rect.top) / Math.max(rect.height - vh * 0.7, 1), 0, 1);
      let closest = 0; let distance = Infinity;
      cards.forEach((card, index) => { const r = card.getBoundingClientRect(); const d = Math.abs(r.top + r.height * 0.5 - vh * 0.5); if (d < distance) { distance = d; closest = index; } });
      state.current.active = Math.min(closest, PROJECTS.length - 1);
    };
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return state;
}

function Artifact({ index, active }: { index: number; active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const seed = useMemo(() => index * 1.73 + 0.4, [index]);
  useFrame(({ clock }) => { if (!group.current) return; const t = clock.getElapsedTime(); const speed = active ? 1 : 0.35; group.current.rotation.y += 0.004 * speed; group.current.rotation.x = Math.sin(t * (0.25 + index * 0.03) + seed) * 0.08; group.current.scale.setScalar(active ? 1 + Math.sin(t * 2.1 + seed) * 0.055 : 1); });
  if (index === 0) return <group ref={group}><mesh><icosahedronGeometry args={[1.05, 2]} /><meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.55} /></mesh><mesh scale={0.7}><icosahedronGeometry args={[1.05, 3]} /><meshBasicMaterial color="#8b7cff" wireframe transparent opacity={0.34} /></mesh><mesh rotation={[Math.PI / 2, 0.2, 0]}><torusGeometry args={[1.25, 0.012, 8, 64]} /><meshBasicMaterial color="#ffd9a0" transparent opacity={0.55} blending={THREE.AdditiveBlending} /></mesh></group>;
  if (index === 1) return <group ref={group}>{Array.from({ length: 48 }, (_, i) => { const x = (i / 47 - 0.5) * 3.2; return <mesh key={i} position={[x, Math.sin(i * 0.48) * 0.3, Math.cos(i * 0.3) * 0.12]}><sphereGeometry args={[0.018 + (i % 4) * 0.005, 6, 6]} /><meshBasicMaterial color="#5eead4" transparent opacity={0.24 + (i % 8 === 0 ? 0.3 : 0)} /></mesh>; })}</group>;
  if (index === 2) return <group ref={group} rotation={[-0.15, 0, 0]}>{Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[0, (i - 2.5) * 0.18, i * 0.04]}><planeGeometry args={[2.15 - i * 0.1, 1.15]} /><meshBasicMaterial color={i % 2 ? '#8b7cff' : '#5eead4'} transparent opacity={0.12 + i * 0.015} side={THREE.DoubleSide} /></mesh>)}</group>;
  if (index === 3) return <group ref={group}>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[(i % 3 - 1) * 0.72, (Math.floor(i / 3) - 1) * 0.58, (i % 2) * 0.22]}><icosahedronGeometry args={[0.1, 1]} /><meshBasicMaterial color={i % 3 === 0 ? '#ffd9a0' : '#5eead4'} transparent opacity={0.55} /></mesh>)}</group>;
  return <group ref={group}>{[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[i * 0.45, i * 0.7, i * 0.32]}><torusGeometry args={[0.72 + i * 0.2, 0.012, 8, 80]} /><meshBasicMaterial color={i % 2 ? '#8b7cff' : '#5eead4'} transparent opacity={0.2 + i * 0.04} blending={THREE.AdditiveBlending} /></mesh>)}</group>;
}

export default function ProjectScene() {
  const state = useProjectState(); const group = useRef<THREE.Group>(null);
  useFrame(() => { if (!group.current) return; const { active, progress, visible } = state.current; group.current.visible = visible; group.current.children.forEach((child, index) => { const offset = index - active; const targetX = offset * 3.1; const targetY = index === active ? 0 : offset * 0.22; const targetZ = -Math.abs(offset) * 1.8 - progress * 0.8; const targetScale = index === active ? 1 : 0.42; child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, 0.065); child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.065); child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, 0.065); child.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.065); }); });
  return <group ref={group}>{PROJECTS.map((_, index) => <group key={_}><Artifact index={index} active={index === state.current.active} /></group>)}</group>;
}
