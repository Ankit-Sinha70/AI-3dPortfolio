// Week 4 polish: custom cursor (dot + lagging ring) and page-load counter.
// Self-contained -- injects its own DOM + styles, so the only change to the
// rest of the app is the import in Layout.astro. Respects prefers-reduced-motion,
// and the cursor only runs on fine-pointer (non-touch) devices.

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

function injectStyles() {
  const css = [
    '.preloader{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:var(--bg);transition:opacity 0.6s ease;}',
    '.preloader.is-done{opacity:0;pointer-events:none;}',
    '.preloader-count{font-family:var(--font-mono);font-variant-numeric:tabular-nums;color:var(--text-dim);font-size:clamp(2rem,8vw,4rem);letter-spacing:0.1em;}',
    '.cursor-dot,.cursor-ring{position:fixed;top:0;left:0;border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);opacity:0;transition:opacity 0.3s ease;}',
    '.cursor-dot{width:6px;height:6px;background:var(--accent);}',
    '.cursor-ring{width:34px;height:34px;border:1px solid rgba(94,234,212,0.5);transition:opacity 0.3s ease,width 0.25s ease,height 0.25s ease,border-color 0.25s ease;}',
    '.cursor-ring.is-hover{width:52px;height:52px;border-color:var(--warm);}',
    '.cursor-active .cursor-dot,.cursor-active .cursor-ring{opacity:1;}',
    '@media (pointer:fine){.cursor-active{cursor:none;}}',
    ].join('');
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

function initPreloader() {
  const overlay = document.createElement('div');
  overlay.className = 'preloader';
  const count = document.createElement('span');
  count.className = 'preloader-count';
  count.textContent = '00';
  overlay.appendChild(count);
  document.body.appendChild(overlay);

if (reduced) {
  overlay.remove();
  return;
}

const duration = 1100;
  const startTime = performance.now();

function tick(now) {
  const t = Math.min((now - startTime) / duration, 1);
  const eased = 1 - Math.pow(1 - t, 3);
  count.textContent = String(Math.round(eased * 100)).padStart(2, '0');
  if (t < 1) {
    requestAnimationFrame(tick);
  } else {
    overlay.classList.add('is-done');
    setTimeout(function () { overlay.remove(); }, 700);
  }
}
  requestAnimationFrame(tick);
}

function initCustomCursor() {
  if (reduced || !finePointer) return;

const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
    ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('cursor-active');

let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

window.addEventListener('mousemove', function (e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

function follow() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(follow);
}
  requestAnimationFrame(follow);

const hoverTargets = document.querySelectorAll('a, button, .card, .cta');
  hoverTargets.forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('is-hover'); });
  });
}

injectStyles();
initPreloader();

document.addEventListener('DOMContentLoaded', function () {
  initCustomCursor();
});
