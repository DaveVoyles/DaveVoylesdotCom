# Handoff

**2026-09-21 — #181 draft still open. Blog REVIEW-FIX pack landed. Do not merge.**

## What this session did

| Work | Notes |
|------|--------|
| Copy | Replaced lede + In brief + glossary from Blog pack. **Capability smokes** = short live checks that send a nonce and require an echo. Glossary splits **Capability smoke** and **Fresh nonce**. `draft = true` unchanged. |
| Visual | D5 Archify/HTML→Chrome PNG: `static/images/posts/two-brains-bender-maya-two-surfaces.png` after Decision table. Two desks + two doors. Not product UI, not Mission Control. Removed `two-brains-bender-maya-dashboards.png` and its refs. Cover stays unique. |
| Preview | Reused hugo on `:1313` (`-D -F --bind 0.0.0.0`). Local `http://127.0.0.1:1313/posts/two-brains-bender-maya/` plus image 200. Tailscale: `http://mini-pro.tail86a7c7.ts.net:1313/posts/two-brains-bender-maya/`. |
| Git | Pushed to `draft/two-brains-bender-maya` only. PR stays draft. Did not merge. |

## Local-only (not committed)

- `/tmp/two-brains-bender-maya-two-surfaces.html` (export source)
- `_inbox/p12-review-fix/` (Blog pack)
- `.omp-handoff/` (unrelated packs)

## Where to start next session

1. Dave review of #181. Keep draft until he says ship.
2. Do **not** set `draft = false` or merge unless asked.
3. Cover warning in `make check` (`cover block without image`) is pre-existing TOML parse noise; `[cover]` image is set.

## Do not

- Do not merge #181.
- Do not use Autodesk Maya WP images as this product.
- Do not put private hostnames, Tailscale URLs, or creds in the post.
- Do not edit `themes/PaperMod/`.
- Do not touch main for this work.
- Do not reuse the cover as a body image.
