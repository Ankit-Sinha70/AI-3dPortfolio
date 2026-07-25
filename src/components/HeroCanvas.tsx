import { Suspense, lazy, useEffect, useState } from 'react';

// Lightweight gate for the 3D hero scene:
// - respects prefers-reduced-motion (skips the scene entirely)
// - skips when WebGL is unavailable (old devices / some mobile browsers),
// falling back to the static gradient painted behind the hero copy
// - lazy-loads the heavy three.js scene in a separate chunk once the
// browser is idle, so the 3D bundle never blocks TTI

// HERO_VARIANT selects which scene renders once the gate above passes.
// 'particles' is the shipped default (ParticleScene.tsx, pointer-reactive
// parallax field). 'aurora' is a dormant alternative (AuroraScene.tsx,
// gradient shader plane) added as a scoped-down first step on the "aurora
// shader OR character variant" backlog item -- it exists and builds, but
// hasn't been visually verified against a local dev server (this workflow
// has no local build), so it stays off by default. Flip this to 'aurora'
// and run `npm run dev` to preview it, then flip back (or make it the
// default) once it's been eyeballed. See docs/ISSUES_BACKLOG.md for the
// follow-up line tracking that step.
const HERO_VARIANT: 'particles' | 'aurora' = 'particles';

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
