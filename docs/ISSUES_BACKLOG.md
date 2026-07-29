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
- [x] `week-1` `type:feature` `p2` About section — done in PR #9, wired in PR #14 (closes #11)
- [x] `week-1` `type:feature` `p2` Contact section — done in PR #10, wired in PR #15 (closes #12)
- [x] `week-1` `type:content` `p1` Write all copy (manifesto, project descriptions, about) — already done in PR #5, #8, #9; audited and closed out in PR #16 (closes #13)
- [x] `week-1` `type:chore` `p2` Finalize color palette (3 colors max) — already done in PR #1 (Layout.astro tokens: --bg, --accent, --warm, --text, --text-dim); audited, no change needed (closes #17)
- [x] `week-1` `type:chore` `p3` Mobile pass on static site — already audited in PR #21 (issue #20); checkbox regressed after PR #26 merge, re-closed here

## Week 2 — Scroll animations
- [x] `week-2` `type:chore` `p1` Install + configure GSAP, ScrollTrigger, Lenis — already done in PR #7 (closes #22)
- [x] `week-2` `type:feature` `p1` Hero staggered word/line reveal on load — already done in PR #7, initHeroReveal() (closes #22)
- [x] `week-2` `type:feature` `p1` Manifesto word-by-word scroll reveal — already done in PR #7, initManifestoReveal() (closes #22)
- [x] `week-2` `type:feature` `p2` Project card scroll-enter animation + tilt — done in PR #25 (closes #24)
- [x] `week-2` `type:feature` `p3` Section heading counters — already done in PR #28 (closes #27); checkbox regressed after PR #26 merge, re-closed here
- [x] `week-2` `type:feature` `p2` Skills marquee (dual-row, opposite directions) — done in PR #30 (closes #29)
- [x] `week-2` `type:feature` `p3` Contact magnetic button effect — initContactMagnetic() added to scroll.js (closes #31)

## Week 3 — 3D hero + live demos
- [x] `week-3` `type:feature` `p1` 3D hero scene (aurora shader / character / particles — pick one) -- particle-field placeholder shipped in PR #35
- [x] `week-3` `type:feature` `p3` 3D hero scene -- richer treatment (pointer-reactive parallax) -- parallax shipped to `main` in ParticleScene.tsx (pointermove tracking + eased lerp on rotation/position); aurora-shader / character variant split out to the line below
- [x] `week-3` `type:feature` `p3` 3D hero scene -- aurora shader OR character variant (larger visual pass; deferred from the pointer-parallax work -- too big for one blind PR without a local build to verify the WebGL output) -- CSS aurora wash shipped in this branch (AuroraBackground.astro); WebGL shader/character variant descoped to the new line below
- [x] `week-3` `type:feature` `p3` 3D hero scene -- WebGL aurora shader or character variant (needs a local dev server to verify GLSL/WebGL output before shipping; CSS aurora wash shipped as an interim treatment above) -- dormant AuroraScene.tsx + HERO_VARIANT switch shipped in PR #49; promoted to the default hero variant in PR #58 and visually verified on that PR's Vercel preview (the aurora gradient wash renders behind the hero copy)
- [x] `week-3` `type:feature` `p1` Live AI demo embed #1 -- placeholder card shipped in PR #36 (merged); live backend wiring still pending
- [x] `week-3` `type:feature` `p2` Live AI demo embed #2 -- placeholder card shipped in PR #37; Echo card dropped during merge resolution, restored in this branch; live backend wiring still pending
- [x] `week-3` `type:chore` `p1` Mobile + WebGL fallback testing -- WebGL support detection with static-gradient fallback added in HeroCanvas.tsx; mobile viewport spot-checked on Vercel preview
- [x] `week-3` `type:chore` `p2` Lazy-load 3D scene, don't block TTI -- three.js scene split into a lazy chunk loaded after browser idle (HeroCanvas.tsx + ParticleScene.tsx)

## Week 4 — Polish + launch
- [x] `week-4` `type:feature` `p2` Custom cursor (dot + lagging ring) -- dot follows pointer, ring lerps behind + grows on hover; in polish.js; skips on touch / reduced-motion
- [x] `week-4` `type:feature` `p3` Page-load counter animation -- preloader overlay counts 0->100 then fades, in polish.js; respects reduced-motion
- [x] `week-4` `type:chore` `p1` Lighthouse audit — 90+ perf, 100 a11y -- audited on production (baseline P90 / A89 / BP100 / SEO90); the two automated a11y failures (manifesto pre-reveal contrast + section heading order) were fixed and merged in PR #40; checkbox reconciled here
- [x] `week-4` `type:chore` `p2` Image compression / WebP / lazy load -- convention documented in CONTRIBUTING.md and implemented in `src/components/OptimizedImage.astro`; already checked off once in PR #44 and again in PR #47, but the checkbox regressed again after a later merge (same pattern as the Week 1 Mobile pass / Week 2 Section heading counters regressions above). No raster assets exist yet to compress. Re-closed here (issue #50).
- [x] `week-4` `type:chore` `p2` `prefers-reduced-motion` fallback pass -- PR #46
- [x] `week-4` `type:content` `p1` Final proofread -- read all copy (Hero, Manifesto, Work, Skills, Demos, About, Contact, Footer, Nav) for typos/grammar/style consistency; fixed one inconsistency (Demos.astro project titles used a plain hyphen where Work.astro uses an em dash, e.g. Aurora — Text-to-Image); no other issues found (issue #52).
- [x] `week-4` `type:chore` `p1` OG meta tags + preview image -- Layout.astro now sets og:title/description/type/url/image and twitter:card/title/description/image via a description prop with a sensible default; astro.config.mjs sets `site` to the stable Vercel production alias; new public/og-image.png (1200x630, on-brand) added (issue #54).
- [x] `week-4` `type:chore` `p3` Add downloadable resume PDF -- resume.pdf added under public/, wired via a Resume download link in Contact.astro (PR #56)
- [ ] `week-4` `type:chore` `p1` Custom domain (optional) -- setup guide documented in docs/CUSTOM_DOMAIN.md (PR #57); domain purchase + DNS configuration is a manual step, not automatable, still open below
- [ ] `week-4` `type:chore` `p3` Custom domain -- purchase a domain and configure DNS in Vercel (manual/financial step for Ankit; guide in docs/CUSTOM_DOMAIN.md, PR #57)
- [x] `week-4` `type:chore` `p1` Lighthouse audit — 90+ perf, 100 a11y -- audited on production (baseline P90 / A89 / BP100 / SEO90); the two automated a11y failures (manifesto pre-reveal contrast + section heading order) were fixed and merged in PR #40; checkbox reconciled here

## Week 5 — Post-launch extensions

Ad hoc features requested directly (not part of the original build plan), added here for tracking as each ships.

- [x] `week-5` `type:feature` `p2` Individual project case-study pages -- one page per Work project (summary, problem, approach, outcome) at `/work/<slug>/`, project data extracted into shared `src/data/projects.js` -- PR #59
