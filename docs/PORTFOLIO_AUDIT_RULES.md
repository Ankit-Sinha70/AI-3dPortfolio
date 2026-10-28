# Portfolio Audit Rules & Implementation Checklist

## Rules
1. Audit the current implementation before changing code. Preserve working behavior and the existing visual identity unless evidence supports a change.
2. Treat source inspection, automated test results, browser observations, and assumptions as different evidence classes. Never report an unrun test or unmeasured performance metric as verified.
3. Make each change small, scoped, and reversible. Do not introduce dependencies without explaining the value and maintenance cost.
4. Keep all implementation off `main`. Work only on `audit/portfolio-reliability` or a clearly scoped branch created from a verified current base. Do not commit, push, reset, rebase, or merge `main` directly.
5. Before creating another implementation phase, verify branch state and pull request status; don't assume any earlier branch/PR was merged.
6. Use the existing Astro, React, React Three Fiber, Three.js, GSAP/ScrollTrigger, and Lenis stack unless a measured/verified need justifies change.
7. Preserve accessible content and navigation when WebGL is unavailable or reduced motion is requested.
8. Prefer targeted file reads and search over repeatedly dumping whole files; summarize evidence to avoid unnecessary token use.
9. Every finding must be labelled Confirmed (direct source evidence or reproducible test) or Needs verification (plausible risk not yet reproduced), with an issue ID, impact, suggested fix, and test.
10. After each phase, run the relevant tests and production build where environment permits; report exact commands/results and blockers.

## Implementation Checklist
- [ ] Verify repository branch and latest commit before editing.
- [ ] Review current source, project conventions, backlog, and active PRs.
- [ ] Establish baseline build/test/performance results where tools and environment permit.
- [ ] Create/maintain issue(s) for significant findings.
- [ ] Prioritize correctness, accessibility, and reliability before new visual features.
- [ ] Unit tests: isolate helpers such as section selection, reduced-motion decision logic, command filtering/selection, route metadata, and scene fallback decisions.
- [ ] Integration tests: navigation and active-section state; Lenis/ScrollTrigger coordination; command palette and assistant shortcuts; WebGL/reduced-motion fallback; work-case-study links.
- [ ] End-to-end tests: initial load; primary CTA to Work; section navigation; mobile menu; command palette keyboard journey; case-study open/back; blog open/back; contact and resume links.
- [ ] Responsive checks: 320/375/430 px mobile, tablet, 1366 px laptop, wide desktop/ultrawide; verify overflow and hit areas.
- [ ] Accessibility checks: keyboard-only navigation, visible focus, labels, dialog focus/escape behavior, reduced-motion mode, contrast, headings, automated accessibility scan.
- [ ] WebGL checks: available/unavailable contexts, context loss/restore, tab visibility, low-power pixel ratio, mobile GPU.
- [ ] Performance checks: measure bundle/build output, Lighthouse or equivalent under documented conditions, frame-time/FPS during idle and scroll, memory/resource behavior, layout shifts. Do not infer scores from code.
- [ ] SEO/production checks: unique title/description/canonical URLs, Open Graph per route, robots and sitemap availability, structured data, 404 status behavior, production URL configuration.
- [ ] Regression checks: all current interactions and design treatments remain intact after changes.
- [ ] Run production build and relevant automated tests.
- [ ] Record unresolved assumptions/manual verification steps.
- [ ] Open PR with summary, evidence, tests actually run, risks, and acceptance criteria; leave merge decision to repository owner.

## Phase acceptance criteria
A phase is complete only when its acceptance criteria are met, the relevant tests/build have actual recorded results, critical limitations are documented, and changes are reviewable in a PR. If local browser access or performance tooling is unavailable, document that limitation instead of claiming visual or performance validation.
