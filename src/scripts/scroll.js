import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cleanupCallbacks = [];
let animationContext;
let disposed = false;

// Use one animation clock for Lenis + GSAP and retain callback references so
// every global subscription can be released when this page is torn down.
if (!prefersReducedMotion) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  const lenisTicker = (time) => lenis.raf(time * 1000);
  const handleLenisScroll = () => ScrollTrigger.update();

  gsap.ticker.add(lenisTicker);
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', handleLenisScroll);

  cleanupCallbacks.push(() => {
    gsap.ticker.remove(lenisTicker);
    lenis.off('scroll', handleLenisScroll);
    lenis.destroy();
  });
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
  const section = document.querySelector('.manifesto');
  const stats = gsap.utils.toArray('.manifesto .stat');
  if (!section || !stats.length) return;

  // Reduced motion (or no animation): the markup already holds the final figures.
  if (prefersReducedMotion) return;

  const row = section.querySelector('.stats');
  const rule = section.querySelector('.stats-rule');
  const counters = stats.map((stat) => stat.querySelector('[data-target]'));

  gsap.set(stats, { opacity: 0, x: 120 });
  gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' });
  counters.forEach((counter) => { counter.textContent = '0'; });

  // Entrance, once: the line draws across, the figures slide in from the right one after another and count up.
  const entrance = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', once: true } });
  entrance
    .to(rule, { scaleX: 1, duration: 1.4, ease: 'power3.out' }, 0)
    .to(stats, { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out', stagger: 0.18 }, 0.1);
  counters.forEach((counter, index) => {
    const state = { value: 0 };
    entrance.to(state, {
      value: Number(counter.dataset.target),
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => { counter.textContent = String(Math.round(state.value)); },
    }, 0.1 + index * 0.18);
  });

  // While the section scrolls past, the whole row drifts slowly sideways.
  gsap.fromTo(row,
    { x: 48 },
    { x: -48, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
  );
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
    cleanupCallbacks.push(() => {
      card.removeEventListener('pointermove', handleMove);
      card.removeEventListener('pointerleave', handleLeave);
      gsap.killTweensOf(card);
    });
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

function initSectionTransitions() {
  const sections = document.querySelectorAll('.skills, .experience, .demos, .about, .contact');
  if (!sections.length) return;

  if (prefersReducedMotion) {
    gsap.set(sections, { opacity: 1, y: 0 });
    return;
  }

  sections.forEach((section) => {
    gsap.fromTo(section,
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          once: true,
        },
      },
    );
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
  cleanupCallbacks.push(() => {
    cta.removeEventListener('pointermove', handleMove);
    cta.removeEventListener('pointerleave', handleLeave);
    gsap.killTweensOf(cta);
  });
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

function initScrollExperience() {
  if (disposed) return;

  animationContext = gsap.context(() => {
    initHeroReveal();
    initHeroScrollChoreography();
    initLogReveal();
    initManifestoReveal();
    initVisionReveal();
    initWorkCardsReveal();
    initCapabilitiesReveal();
    initSectionCounters();
    initSectionTransitions();
    initContactMagnetic();
    initScrollProgressRail();
  });
}

function cleanupScrollExperience() {
  if (disposed) return;
  disposed = true;

  for (const cleanup of cleanupCallbacks.splice(0).reverse()) {
    cleanup();
  }

  animationContext?.revert();
  animationContext = undefined;
}

function handlePageHide(event) {
  // A page kept in the back-forward cache is still live and may be restored.
  if (event.persisted) return;

  cleanupScrollExperience();
  window.removeEventListener('pagehide', handlePageHide);
}

window.addEventListener('pagehide', handlePageHide);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollExperience, { once: true });
} else {
  initScrollExperience();
}
