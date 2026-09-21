# Handoff

**2026-09-21 — #181 draft still open. Smoke definition + teaching two-doors diagram. Do not merge.**

## What this session did

| Work | Notes |
|------|--------|
| Copy | First-use **capability smokes** = short nonce checks that prove each brain's door answers, not process-up. Glossary names **Smoke / smokes**. |
| Visual | No real Maya/Hermes dashboard in repo. Landed Archify-style HTML→Chrome PNG: `static/images/posts/two-brains-bender-maya-dashboards.png` after Situation. Labeled teaching illustration, not a product shot. Scope = role split + doors only. |
| Preview | Existing `hugo server -D -F --bind 0.0.0.0 --port 1313`. `http://127.0.0.1:1313/posts/two-brains-bender-maya/` HTTP 200. Tailscale: `http://mini-pro.tail86a7c7.ts.net:1313/posts/two-brains-bender-maya/`. |
| Git | Pushed to `draft/two-brains-bender-maya` only. PR stays draft. `draft = true` unchanged. |

## Local-only (not committed)

- `/tmp/two-brains-bender-maya-dashboards.html` (export source)
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
