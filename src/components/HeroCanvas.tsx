import { Suspense, lazy, useEffect, useState } from 'react';
import SceneFallback from './SceneFallback';

// Keep the heavy 3D hero out of the critical path while respecting accessibility
// and devices that cannot provide WebGL.
const HERO_VARIANT: 'core' | 'particles' | 'aurora' = 'core';

const AICoreScene = lazy(() => import('./AICoreScene.tsx'));
const ParticleScene = lazy(() => import('./ParticleScene.tsx'));
const AuroraScene = lazy(() => import('./AuroraScene.tsx'));

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch { return false; }
}

export default function HeroCanvas() {
  const [ready, setReady] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(true);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduced = reducedQuery.matches;
    const webgl = supportsWebGL();
    setMotionAllowed(!reduced); setWebglAvailable(webgl);
    if (reduced || !webgl) return;

    const handleVisibility = () => setPageVisible(document.visibilityState === 'visible');
    handleVisibility(); document.addEventListener('visibilitychange', handleVisibility);
    const idle = (window as typeof window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void; }).requestIdleCallback;
    if (idle) {
      const id = idle(() => setReady(true), { timeout: 2000 });
      return () => { window.cancelIdleCallback?.(id); document.removeEventListener('visibilitychange', handleVisibility); };
    }
    const id = window.setTimeout(() => setReady(true), 200);
    return () => { window.clearTimeout(id); document.removeEventListener('visibilitychange', handleVisibility); };
  }, []);

  if (!webglAvailable || !motionAllowed) return <SceneFallback />;
  if (!ready || !pageVisible) return null;

  const Scene = HERO_VARIANT === 'core' ? AICoreScene : HERO_VARIANT === 'aurora' ? AuroraScene : ParticleScene;
  return <Suspense fallback={<SceneFallback />}><Scene /></Suspense>;
}
