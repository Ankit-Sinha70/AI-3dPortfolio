# Performance baseline

Measured on 28 October 2026 with `scripts/measure-perf.mjs` (Playwright 1.63, headless Chromium). Branch `improve/phase-1-reliability`, which is `main` plus the SEO commit. Each row is the average of 2 runs.

**Read this first.** The test machine is a cloud sandbox. Headless Chromium renders WebGL in software there, so the frame rates are far below what a laptop GPU would show. Use these numbers to compare changes made on the same machine, not as absolute frame rates for real visitors. A real-device check is still needed.

| Build | Viewport | Idle fps | Idle avg frame (ms) | Scroll fps | Scroll avg frame (ms) | Frames over 50 ms while scrolling | Preloader gone (ms) | WebGL canvases | JS heap (MB) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3D on (default) | desktop | 2.0 | 527.8 | 2.0 | 425.0 | 10 | 4804 | 1 | 11 |
| 3D on (default) | mobile | 4.5 | 217.7 | 6.0 | 179.0 | 23 | 3570 | 1 | 13 |
| 3D off (WebGL disabled) | desktop | 14.5 | 69.8 | 14.5 | 69.2 | 48 | 1740 | 0 | 10 |
| 3D off (WebGL disabled) | mobile | 40.5 | 24.9 | 41.5 | 24.2 | 1 | 1796 | 0 | 10 |

## What the numbers show

- The 3D scene is the largest single cost in this environment. With WebGL disabled, desktop frame time drops from about 500 ms to about 70 ms. Mobile drops from about 200 ms to about 25 ms.
- The page is still heavy without WebGL on desktop, about 15 fps here. The likely contributors are the animated CSS blur layers (`AuroraBackground.astro` uses a 40 px blur, `PortfolioStage.astro` blurs the canvas in the work section). Phase 3 will test this directly.
- Cumulative layout shift was 0 in every run.
- No horizontal page overflow at 1366 px or 390 px.
- The 1.1 s preloader (`polish.js`) runs on every visit. It was gone after about 1.7 s with WebGL disabled and 3 to 5 s with it enabled. The longer time reflects how busy the main thread was, not the preloader length alone.
- The only console error is a blocked external request, `ERR_TUNNEL_CONNECTION_FAILED`. It comes from this sandbox's network proxy and is not a site bug.

## Not measured yet

- Real GPU frame rates on a laptop or phone.
- Lighthouse scores.
- Memory growth over a long session, and WebGL context loss and restore.
- Behaviour on low-power devices and with reduced motion enabled.

## How to reproduce

```
npm install
npm run build
npm run preview            # in one terminal, serves http://localhost:4321/
SITE_URL=http://localhost:4321/ npm run perf:measure
NOGL=1 SITE_URL=http://localhost:4321/ npm run perf:measure   # 3D disabled
```
