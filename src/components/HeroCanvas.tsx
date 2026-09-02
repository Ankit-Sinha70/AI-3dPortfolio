import { Suspense, lazy, useEffect, useState } from 'react';

// Keep the heavy 3D hero out of the critical path while respecting accessibility
// and devices that cannot provide WebGL.
const HERO_VARIANT: 'core' | 'particles' | 'aurora' = 'core';

const AICoreScene = lazy(() => import('./AICoreScene.tsx'));
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

    const idle = (window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;

    if (idle) {
      const id = idle(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  const Scene =
    HERO_VARIANT === 'core'
      ? AICoreScene
      : HERO_VARIANT === 'aurora'
        ? AuroraScene
        : ParticleScene;

  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
