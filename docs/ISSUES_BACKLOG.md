# Issue backlog

Ready-to-file issues, pulled from the build plan. File these on GitHub (or ask Claude to, once GitHub access is connected), one per row, using the Feature issue template. Check off here once filed.

## Week 1 — Foundation
- [x] `week-1` `type:chore` `p1` Set up Tailwind CSS (optional utility layer) — done in PR #3
- [x] `week-1` `type:chore` `p1` Build `Layout.astro` — base HTML shell, meta tags, fonts — done in PR #1
- [x] `week-1` `type:feature` `p1` Build `Nav.astro` — fixed nav, links, name/logo — done in PR #1
- [x] `week-1` `type:feature` `p1` Build `Hero.astro` structure (placeholder for 3D) — done in PR #1
- [x] `week-1` `type:chore` `p2` Build `Footer.astro` — done in PR #1
- [x] `week-1` `type:feature` `p1` Manifesto section (static) — done in PR #5
- [x] `week-1` `type:feature` `p1` Work section — 5 project cards (static layout) — done in PR #8
- [ ] `week-1` `type:feature` `p2` About section
- [ ] `week-1` `type:feature` `p2` Contact section
- [x] `week-1` `type:content` `p1` Write all copy (manifesto, project descriptions, about) — already done in PR #5, #8, #9; audited and closed out in PR #16 (closes #13)
- [ ] `week-1` `type:chore` `p2` Finalize color palette (3 colors max)
- [ ] `week-1` `type:chore` `p3` Mobile pass on static site

## Week 2 — Scroll animations
- [ ] `week-2` `type:chore` `p1` Install + configure GSAP, ScrollTrigger, Lenis
- [ ] `week-2` `type:feature` `p1` Hero staggered word/line reveal on load
- [ ] `week-2` `type:feature` `p1` Manifesto word-by-word scroll reveal
- [ ] `week-2` `type:feature` `p2` Project card scroll-enter animation + tilt
- [ ] `week-2` `type:feature` `p3` Section heading counters
- [ ] `week-2` `type:feature` `p2` Skills marquee (dual-row, opposite directions)
- [ ] `week-2` `type:feature` `p3` Contact magnetic button effect

## Week 3 — 3D hero + live demos
- [ ] `week-3` `type:feature` `p1` 3D hero scene (aurora shader / character / particles — pick one)
- [ ] `week-3` `type:feature` `p1` Live AI demo embed #1
- [ ] `week-3` `type:feature` `p2` Live AI demo embed #2
- [ ] `week-3` `type:chore` `p1` Mobile + WebGL fallback testing
- [ ] `week-3` `type:chore` `p2` Lazy-load 3D scene, don't block TTI

## Week 4 — Polish + launch
- [ ] `week-4` `type:feature` `p2` Custom cursor (dot + lagging ring)
- [ ] `week-4` `type:feature` `p3` Page-load counter animation
- [ ] `week-4` `type:chore` `p1` Lighthouse audit — 90+ perf, 100 a11y
- [ ] `week-4` `type:chore` `p2` Image compression / WebP / lazy load
- [ ] `week-4` `type:chore` `p2` `prefers-reduced-motion` fallback pass
- [ ] `week-4` `type:content` `p1` Final proofread
- [ ] `week-4` `type:chore` `p1` OG meta tags + preview image
- [ ] `week-4` `type:chore` `p3` Add downloadable resume PDF
- [ ] `week-4` `type:chore` `p1` Custom domain (optional)
