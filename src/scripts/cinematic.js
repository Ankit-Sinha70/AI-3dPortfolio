const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CHAPTERS = [
  { selector: '.hero', x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  { selector: '.manifesto', x: -2.2, y: -0.8, scale: 1.015, rotate: -0.25, opacity: 0.94 },
  { selector: '.vision', x: 1.8, y: 0.5, scale: 1.03, rotate: 0.3, opacity: 0.96 },
  { selector: '.work', x: 3.8, y: 1.2, scale: 1.055, rotate: 0.5, opacity: 0.72 },
  { selector: '.skills', x: -2.4, y: -1, scale: 1.025, rotate: -0.35, opacity: 0.88 },
  { selector: '.capabilities', x: 2.5, y: 0.8, scale: 1.045, rotate: 0.35, opacity: 0.9 },
  { selector: '.experience', x: -1.8, y: 0.3, scale: 1.03, rotate: -0.2, opacity: 0.9 },
  { selector: '.demos', x: 2, y: -0.5, scale: 1.05, rotate: 0.3, opacity: 0.86 },
  { selector: '.about', x: -2.5, y: 0.7, scale: 1.035, rotate: -0.3, opacity: 0.9 },
  { selector: '.contact', x: 0, y: -0.5, scale: 1.08, rotate: 0, opacity: 1 },
  { selector: '.log', x: 0, y: 0, scale: 1.04, rotate: 0, opacity: 0.82 },
];

function initCinematicStage() {
  const stage = document.querySelector('.portfolio-stage');
  if (!stage || prefersReducedMotion) return;

  const chapters = CHAPTERS
    .map((chapter) => ({ ...chapter, element: document.querySelector(chapter.selector) }))
    .filter((chapter) => chapter.element);

  if (!chapters.length) return;

  let frame = 0;
  let lastChapter = -1;

  const setStage = () => {
    frame = 0;
    const viewport = window.innerHeight;
    const midpoint = window.scrollY + viewport * 0.48;

    let activeIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    chapters.forEach((chapter, index) => {
      const rect = chapter.element.getBoundingClientRect();
      const center = window.scrollY + rect.top + rect.height * 0.5;
      const distance = Math.abs(center - midpoint);
      if (distance < bestDistance) {
        bestDistance = distance;
        activeIndex = index;
      }
    });

    const chapter = chapters[activeIndex];
    if (activeIndex !== lastChapter) {
      stage.dataset.chapter = chapter.selector.slice(1);
      lastChapter = activeIndex;
    }

    stage.style.setProperty('--scene-x', `${chapter.x}%`);
    stage.style.setProperty('--scene-y', `${chapter.y}%`);
    stage.style.setProperty('--scene-scale', String(chapter.scale));
    stage.style.setProperty('--scene-rotate', `${chapter.rotate}deg`);
    stage.style.setProperty('--scene-opacity', String(chapter.opacity));
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(setStage);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  requestUpdate();
}

document.addEventListener('DOMContentLoaded', initCinematicStage);
