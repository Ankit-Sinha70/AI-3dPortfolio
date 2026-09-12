import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function ScenePerformance() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const isMobile = window.matchMedia('(max-width: 800px)').matches;
    const lowPower = memory <= 4 || cores <= 4 || isMobile;
    const pixelRatio = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    gl.setPixelRatio(pixelRatio);

    return () => {
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    };
  }, [gl]);

  return null;
}
