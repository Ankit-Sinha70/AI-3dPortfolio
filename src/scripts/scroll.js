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

    // Initial opacity bumped from 0.15 to 0.5 -- 0.15 failed WCAG AA contrast
    // in the Lighthouse a11y audit (pre-reveal text was unreadably dim)
    gsap.set(words, { opacity: 0.5 });
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

// Work: project card scroll-enter reveal + mouse tilt
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
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
      },
    });

    const maxTilt = 6;

    function handleMove(e) {
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
    }

    function handleLeave() {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    }

    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', handleLeave);
  });
}

// Section headings: numbered counter that ticks up when scrolled into view
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
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
      onUpdate: () => {
        el.textContent = String(Math.round(counterObj.value)).padStart(2, '0');
      },
    });
  });
}

// Capabilities: text blocks fade in individually on scroll enter
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
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
      },
    });
  });
}

// Contact: magnetic hover effect on the primary CTA button
function initContactMagnetic() {
  const cta = document.querySelector('.contact .cta');
  if (!cta) return;
  if (prefersReducedMotion) return;
  const maxOffsetX = 14;
  const maxOffsetY = 8;
  function handleMove(e) {
    const rect = cta.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cta, {
      x: px * maxOffsetX,
      y: py * maxOffsetY,
      duration: 0.4,
      ease: 'power2.out',
    });
  }
  function handleLeave() {
    gsap.to(cta, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    });
  }
  cta.addEventListener('pointermove', handleMove);
  cta.addEventListener('pointerleave', handleLeave);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroReveal();
  initManifestoReveal();
  initWorkCardsReveal();
  initCapabilitiesReveal();
  initSectionCounters();
  initContactMagnetic();
});
