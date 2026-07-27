import { Suspense, lazy, useEffect, useState } from 'react';

// Lightweight gate for the 3D hero scene:
// - respects prefers-reduced-motion (skips the scene entirely)
// - skips when WebGL is unavailable (old devices / some mobile browsers),
// falling back to the static gradient painted behind the hero copy
// - lazy-loads the heavy three.js scene in a separate chunk once the
// browser is idle, so the 3D bundle never blocks TTI

// HERO_VARIANT selects which scene renders once the gate above passes.
// 'aurora' is now the default (AuroraScene.tsx, a slow-drifting gradient
// shader plane blending the --accent and --warm tokens). 'particles'
// (ParticleScene.tsx, pointer-reactive parallax field) remains available
// as an alternative. This promotes the previously dormant aurora variant
// to the live hero visual, closing the "aurora shader OR character
// variant" backlog item. The result was verified by loading the PR's
// Vercel preview deploy (the aurora wash renders behind the hero copy),
// not a local dev server. Flip this constant back to 'particles' to
// restore the particle field.
const HERO_VARIANT: 'particles' | 'aurora' = 'aurora';

const ParticleScene = lazy(() => import('./ParticleScene.tsx'));
const AuroraScene = lazy(() => import('./AuroraScene.tsx'));

function supportsWebGL(): boolean {
try {
const canvas = document.createElement('canvas');
return Boolean(
window.WebGLRenderingContext &&
(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
);
} catch {
return false;
}
}

export default function HeroCanvas() {
const [ready, setReady] = useState(false);

useEffect(() => {
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced || !supportsWebGL()) return;

const idle = (window as any).requestIdleCallback as
| ((cb: () => void, opts?: { timeout: number }) => number)
| undefined;

if (idle) {
const id = idle(() => setReady(true), { timeout: 2000 });
return () => (window as any).cancelIdleCallback?.(id);
}
const id = window.setTimeout(() => setReady(true), 200);
return () => window.clearTimeout(id);
}, []);

if (!ready) return null;

const Scene = HERO_VARIANT === 'aurora' ? AuroraScene : ParticleScene;

return (
<Suspense fallback={null}>
<Scene />
</Suspense>
);
}
