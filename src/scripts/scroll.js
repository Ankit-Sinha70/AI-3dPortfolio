import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Use a single animation clock for Lenis + GSAP. Running Lenis from both its
// own requestAnimationFrame and the GSAP ticker causes duplicate work and can
// produce uneven scroll timing on high-refresh displays.
if (!prefersReducedMotion) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

function initHeroReveal() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const targets = [
    hero.querySelector('.eyebrow'),
    hero.querySelector('h1'),
    hero.querySelector('.subline'),
    hero.querySelector('.hero-actions'),
    hero.querySelector('.hero-meta'),
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
    stagger: 0.1,
    delay: 0.2,
  });
}

function initHeroScrollChoreography() {
  const hero = document.querySelector('.hero');
  if (!hero || prefersReducedMotion) return;

  const copy = hero.querySelector('.hero-copy');
  const meta = hero.querySelector('.hero-meta');
  if (!copy) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8,
    },
  })
    .to(copy, { y: -80, opacity: 0.25, ease: 'none' }, 0)
    .to(meta, { y: 40, opacity: 0, ease: 'none' }, 0);
}

function initLogReveal() {
  const entries = document.querySelectorAll('.log .log-entry');
  if (!entries.length) return;

  if (prefersReducedMotion) {
    gsap.set(entries, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(entries, { opacity: 0, y: 16 });
  gsap.to(entries, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: { trigger: '.log', start: 'top 80%' },
  });
}

function initManifestoReveal() {
  const lines = document.querySelectorAll('.manifesto .line');
  if (!lines.length) return;

  lines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(' ');
  });

  const words = document.querySelectorAll('.manifesto .word');
  if (prefersReducedMotion) {
    gsap.set(words, { opacity: 1 });
    return;
  }

  gsap.set(words, { opacity: 0.5 });
  gsap.to(words, {
    opacity: 1,
    stagger: 0.03,
    ease: 'none',
    scrollTrigger: { trigger: '.manifesto', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
  });
}

function initVisionReveal() {
  const section = document.querySelector('.vision');
  if (!section) return;

  const shapes = section.querySelectorAll('.v-shape');
  const line = section.querySelector('.vision-line');
  if (!shapes.length || !line) return;

  if (prefersReducedMotion) {
    gsap.set(shapes, { opacity: 0.55 });
    gsap.set(line, { opacity: 1 });
    return;
  }

  shapes.forEach((shape) => {
    const length = shape.getTotalLength();
    gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length, opacity: 0.55 });
  });

  gsap.set(line, { opacity: 0, y: 12 });
  gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 75%', end: 'bottom 40%', scrub: 0.6 },
  })
    .to(shapes, { strokeDashoffset: 0, stagger: 0.15, ease: 'none' })
    .to(line, { opacity: 1, y: 0, ease: 'none' }, '-=0.3');
}

function initWorkCardsReveal() {
  const cards = document.querySelectorAll('.work .card');
  if (!cards.length) return;

  if (prefersReducedMotion) {
    gsap.set(cards, { opacity: 1, y: 0 });
    return;
  }

  cards.forEach((card) => {
    gsap.set(card, { opacity: 0, y: 32 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%' },
    });

    const maxTilt = 6;
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateX: py * -maxTilt,
        rotateY: px * maxTilt,
        transformPerspective: 600,
        duration: 0.4,
        ease: 'power2.out',
      });
    };
    const handleLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' });

    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', handleLeave);
  });
}

function initSectionCounters() {
  const counters = document.querySelectorAll('.section-counter[data-count]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = String(target).padStart(2, '0');
      return;
    }

    el.textContent = '00';
    const counterObj = { value: 0 };
    gsap.to(counterObj, {
      value: target,
      duration: 1,
      ease: 'power1.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => { el.textContent = String(Math.round(counterObj.value)).padStart(2, '0'); },
    });
  });
}

function initCapabilitiesReveal() {
  const items = document.querySelectorAll('.capabilities .capability');
  if (!items.length) return;

  if (prefersReducedMotion) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  items.forEach((item) => {
    gsap.set(item, { opacity: 0, y: 24 });
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 88%' },
    });
  });
}

function initContactMagnetic() {
  const cta = document.querySelector('.contact .cta');
  if (!cta || prefersReducedMotion) return;

  const handleMove = (e) => {
    const rect = cta.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cta, { x: px * 14, y: py * 8, duration: 0.4, ease: 'power2.out' });
  };
  const handleLeave = () => gsap.to(cta, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });

  cta.addEventListener('pointermove', handleMove);
  cta.addEventListener('pointerleave', handleLeave);
}

function initScrollProgressRail() {
  const fill = document.querySelector('.scroll-progress-fill');
  if (!fill) return;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      fill.style.height = `${self.progress * 100}%`;
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initHeroScrollChoreography();
  initLogReveal();
  initManifestoReveal();
  initVisionReveal();
  initWorkCardsReveal();
  initCapabilitiesReveal();
  initSectionCounters();
  initContactMagnetic();
  initScrollProgressRail();
});
