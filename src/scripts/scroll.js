import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Smooth scroll
if (!prefersReducedMotion) {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

// Hero: staggered reveal on page load
function initHeroReveal() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const targets = [
    hero.querySelector('.eyebrow'),
    hero.querySelector('h1'),
    hero.querySelector('.subline'),
    hero.querySelector('.scroll-indicator'),
  ].filter(Boolean);

  if (prefersReducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(targets, { opacity: 0, y: 24 });
  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.2,
  });
}

// Manifesto: word-by-word reveal driven by scroll
function initManifestoReveal() {
  const lines = document.querySelectorAll('.manifesto .line');
  if (!lines.length) return;

  lines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.innerHTML = words
      .map((word) => `<span class="word">${word}</span>`)
      .join(' ');
  });

  const words = document.querySelectorAll('.manifesto .word');

  if (prefersReducedMotion) {
    gsap.set(words, { opacity: 1 });
    return;
  }

  gsap.set(words, { opacity: 0.15 });
  gsap.to(words, {
    opacity: 1,
    stagger: 0.03,
    ease: 'none',
    scrollTrigger: {
      trigger: '.manifesto',
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.6,
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initManifestoReveal();
});
