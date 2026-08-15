# Handoff

**2026-08-14 — plan 0084 D12 / #141 web-design-standards adoption.**

## What shipped this session

| Work | Notes |
|------|--------|
| #141 Adopt web-design-standards | `--ds-*` tokens in `assets/css/extended/00-tokens.css`; PaperMod aliases in `custom.css` (including dark selectors); type/spacing/radius/motion scales; breakpoints snapped to 640/1024/1440; shells mobile-first at 1024; sectioned CSS; skip-link; theme-color `#faf9f4`; `scripts/check-ds-tokens.sh` in `make check` + CI. Identity kept (terminal-green console). |

## Local-only (not committed)

- `.gitignore` may still have extra landing-floor ignore lines vs origin — leave it; not part of this PR.

## Where to start next session

1. After merge, hard-refresh live site and check light/dark toggle + reduced-motion hero (`/` and `/about/`).
2. Plan 0084 siblings (not this repo): Harriton #20, CFB26 #1, Philly #3, etc.
3. Remaining #141-adjacent debt: off-grid rem paddings, leftover `max-width` component queries, PaperMod noscript still injects stock RGB (our aliases out-specify it).

## Do not

- Do not edit `themes/PaperMod/` for site features — overrides live in `layouts/` and `assets/`.
- Do not invent claim-unsafe metrics — see `docs/claim-safe-facts.md`.
- Do not declare PaperMod color aliases only on bare `:root` — dark theme-vars will win.
