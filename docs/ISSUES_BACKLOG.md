# Issue backlog

Ready-to-file issues, pulled from the build plan. File these on GitHub (or ask Claude to, once GitHub access is connected), one per row, using the Feature issue template. Check off here once filed.

## Week 1 â Foundation
- [x] `week-1` `type:chore` `p1` Set up Tailwind CSS (optional utility layer) â done in PR #3
- [x] `week-1` `type:chore` `p1` Build `Layout.astro` â base HTML shell, meta tags, fonts â done in PR #1
- [x] `week-1` `type:feature` `p1` Build `Nav.astro` â fixed nav, links, name/logo â done in PR #1
- [x] `week-1` `type:feature` `p1` Build `Hero.astro` structure (placeholder for 3D) â done in PR #1
- [x] `week-1` `type:chore` `p2` Build `Footer.astro` â done in PR #1
- [x] `week-1` `type:feature` `p1` Manifesto section (static) â done in PR #5
- [x] `week-1` `type:feature` `p1` Work section â 5 project cards (static layout) â done in PR #8
- [x] `week-1` `type:feature` `p2` About section â done in PR #9, wired in PR #14 (closes #11)
- [x] `week-1` `type:feature` `p2` Contact section â done in PR #10, wired in PR #15 (closes #12)
- [x] `week-1` `type:content` `p1` Write all copy (manifesto, project descriptions, about) â already done in PR #5, #8, #9; audited and closed out in PR #16 (closes #13)
- [x] `week-1` `type:chore` `p2` Finalize color palette (3 colors max) â already done in PR #1 (Layout.astro tokens: --bg, --accent, --warm, --text, --text-dim); audited, no change needed (closes #17)
- [ ] `week-1` `type:chore` `p3` Mobile pass on static site

## Week 2 â Scroll animations
- [x] `week-2` `type:chore` `p1` Install + configure GSAP, ScrollTrigger, Lenis â already done in PR #7 (closes #22)
- [x] `week-2` `type:feature` `p1` Hero staggered word/line reveal on load â already done in PR #7, initHeroReveal() (closes #22)
- [x] `week-2` `type:feature` `p1` Manifesto word-by-word scroll reveal â already done in PR #7, initManifestoReveal() (closes #22)
- [ ] `week-2` `type:feature` `p2` Project card scroll-enter animation + tilt
- [ ] `week-2` `type:feature` `p3` Section heading counters
- [x] `week-2` `type:feature` `p2` Skills marquee (dual-row, opposite directions) â done in PR #30 (closes #29)
- [ ] `week-2` `type:feature` `p3` Contact magnetic button effect

## Week 3 â 3D hero + live demos
- [ ] `week-3` `type:feature` `p1` 3D hero scene (aurora shader / character / particles â pick one)
- [ ] `week-3` `type:feature` `p1` Live AI demo embed #1
- [ ] `week-3` `type:feature` `p2` Live AI demo embed #2
- [ ] `week-3` `type:chore` `p1` Mobile + WebGL fallback testing
- [ ] `week-3` `type:chore` `p2` Lazy-load 3D scene, don't block TTI

## Week 4 â Polish + launch
- [ ] `week-4` `type:feature` `p2` Custom cursor (dot + lagging ring)
- [ ] `week-4` `type:feature` `p3` Page-load counter animation
- [ ] `week-4` `type:chore` `p1` Lighthouse audit â 90+ perf, 100 a11y
- [ ] `week-4` `type:chore` `p2` Image compression / WebP / lazy load
- [ ] `week-4` `type:chore` `p2` `prefers-reduced-motion` fallback pass
- [ ] `week-4` `type:content` `p1` Final proofread
- [ ] `week-4` `type:chore` `p1` OG meta tags + preview image
- [ ] `week-4` `type:chore` `p3` Add downloadable resume PDF
- [ ] `week-4` `type:chore` `p1` Custom domain (optional)
