// Browser performance measurement for the built portfolio (Phase 2 baseline).
// Usage: npm run build && npm run preview  (in another terminal)
//        SITE_URL=http://localhost:4321/ node scripts/measure-perf.mjs > perf.json
//        NOGL=1 ... to disable WebGL and measure the non-3D page cost.
// NOTE: headless Chromium renders WebGL in software on most machines, so absolute
// frame times are NOT representative of a GPU laptop. Compare runs on the same machine.
import { chromium } from 'playwright';

const URL = process.env.SITE_URL || 'http://127.0.0.1:4321/';
const RUNS = Number(process.env.RUNS || 2);
const VIEWPORTS = {
  desktop: { width: 1366, height: 768, isMobile: false },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

async function measureOne(browser, name, vp) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'load' });
  const loadMs = Date.now() - t0;

  // Wait for the 1.1s preloader to finish (polish.js), then settle.
  const preloaderGoneMs = await page.evaluate(() => new Promise((resolve) => {
    const start = performance.now();
    const check = () => {
      if (!document.querySelector('.preloader')) return resolve(Math.round(performance.now() - start));
      if (performance.now() - start > 8000) return resolve(-1);
      setTimeout(check, 50);
    };
    check();
  }));
  await page.waitForTimeout(1500);

  const navTiming = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { domContentLoadedMs: Math.round(n.domContentLoadedEventEnd), fcpMs: fcp ? Math.round(fcp.startTime) : null };
  });

  // Frame timing helper: records rAF intervals for `ms` milliseconds.
  const frameStats = (ms, scroll) => page.evaluate(({ ms, scroll }) => new Promise((resolve) => {
    const deltas = [];
    let last = null;
    const start = performance.now();
    let stepY = 0;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const step = (now) => {
      if (last !== null) deltas.push(now - last);
      last = now;
      if (scroll) {
        stepY = Math.min(stepY + scroll, scrollMax);
        window.scrollTo(0, stepY);
      }
      if (now - start < ms) requestAnimationFrame(step);
      else {
        deltas.sort((a, b) => a - b);
        const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
        const p = (q) => deltas[Math.min(deltas.length - 1, Math.floor(q * deltas.length))];
        resolve({ frames: deltas.length, fps: Math.round(1000 / avg), avgFrameMs: +avg.toFixed(1), p95FrameMs: +p(0.95).toFixed(1), worstFrameMs: +deltas[deltas.length - 1].toFixed(1), longFrames50ms: deltas.filter((d) => d > 50).length });
      }
    };
    requestAnimationFrame(step);
  }), { ms, scroll });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const idle = await frameStats(3000, 0);
  const scrolling = await frameStats(4000, 6);

  const extra = await page.evaluate(() => {
    const canvases = [...document.querySelectorAll('canvas')];
    const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
    return { canvasCount: canvases.length, canvasDisplayPx: canvases.map((c) => `${c.width}x${c.height}`), jsHeapMB: mem, domNodes: document.getElementsByTagName('*').length };
  });

  const cls = await page.evaluate(() => new Promise((resolve) => {
    // Layout shift recorded since page load.
    let total = 0;
    try { for (const e of performance.getEntriesByType('layout-shift')) if (!e.hadRecentInput) total += e.value; } catch {}
    resolve(+total.toFixed(4));
  }));

  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  await ctx.close();
  return { viewport: name, size: `${vp.width}x${vp.height}`, loadMs, preloaderGoneMs, ...navTiming, idle, scrolling, ...extra, cumulativeLayoutShift: cls, horizontalOverflowPx: overflowX, errors: [...new Set(errors)].slice(0, 8) };
}

// Set NOGL=1 to disable WebGL and measure the non-3D page cost.
const args = process.env.NOGL ? ['--disable-webgl', '--disable-3d-apis'] : ['--ignore-gpu-blocklist'];
const browser = await chromium.launch({ args });
const results = [];
for (let r = 0; r < RUNS; r++) {
  for (const [name, vp] of Object.entries(VIEWPORTS)) {
    results.push({ run: r + 1, ...(await measureOne(browser, name, vp)) });
  }
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
