# Workflow

Solo-dev trunk-based workflow for this project. `main` is always deployable and connected to Vercel (every merge auto-deploys to production; every PR gets a preview URL).

## Branches

| Prefix | Use for | Example |
|---|---|---|
| `feature/` | New sections, components, capabilities | `feature/hero-3d-scene` |
| `fix/` | Bug fixes | `fix/mobile-nav-overlap` |
| `chore/` | Tooling, deps, config, CI | `chore/upgrade-astro` |
| `content/` | Copy-only changes | `content/about-section` |

Rules:
- Branch off `main`.
- Name in kebab-case, no spaces.
- If the branch closes an issue, prefix with the issue number: `feature/12-hero-3d-scene`.
- Delete the branch after merge.

## Commits — Conventional Commits

```
<type>(<scope>): <short summary>
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`

Examples:
```
feat(hero): add aurora shader background
fix(nav): correct z-index stacking on mobile
chore(deps): bump gsap to 3.12.5
docs(readme): add local dev instructions
```

Keep commits scoped to one logical change. Squash noisy WIP commits before opening a PR.

## Issues

Every unit of work in the [Build Plan](./README.md) becomes a GitHub issue before a branch is created. Use the issue templates in `.github/ISSUE_TEMPLATE/`.

Labels:
- `week-1` … `week-4` — maps to the build plan phase
- `type:feature` / `type:bug` / `type:chore` / `type:content`
- `priority:p1` (blocking) / `priority:p2` (should-have) / `priority:p3` (nice-to-have)

## Pull requests

1. Open an issue (or reference an existing one).
2. Branch off `main`: `git checkout -b feature/12-hero-3d-scene`
3. Commit using the convention above.
4. Push and open a PR using the PR template. Link the issue with `Closes #12`.
5. Check the Vercel preview deploy on the PR.
6. Squash-merge into `main`.
7. Delete the branch.

## Release / deploy

No separate release branch — every merge to `main` is a production deploy via Vercel. Treat `main` as production: don't push directly to it, always go through a PR (even solo, this keeps history clean and gives you a preview URL to sanity-check before it's live).


## Images

The repo has no raster image assets yet -- the only binary in `public/` is `favicon.svg`, and every section background is a CSS gradient -- so there is nothing to compress right now. This section records the convention to follow once real images are added, so the "Image compression / WebP / lazy load" build-plan item has a documented answer rather than an empty checkbox.

When a raster image is added: prefer WebP or AVIF with a JPEG/PNG fallback via `<picture>`; always set explicit `width` and `height` (or an aspect-ratio box) so the image reserves space and doesn't cause layout shift; add `loading="lazy"` and `decoding="async"` to anything below the fold, while keeping the hero / LCP image eager so it isn't delayed; and run assets through a compressor (e.g. Squoosh) before committing, targeting roughly 150 KB or less for full-width images. SVGs such as the favicon don't need compression but should be minified (e.g. SVGO) if hand-authored.
