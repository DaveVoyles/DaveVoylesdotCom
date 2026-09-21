# Handoff

**2026-09-21 — #180 draft still open. Blog REVIEW-FIX pack landed. Do not merge.**

## What this session did

| Work | Notes |
|------|--------|
| Copy | Replaced `content/posts/green-suites-that-hid-holes.md` from Blog pack. Lede defines **green** (dashboard “safe to ship”) then **CI** (automated check-runner). Glossary adds **CI**, **Green**, **Red** before Bind-all. In brief tags green as CI pass badges. Why-it-matters: exec readiness vs implementer “jobs that ran did not fail.” `draft = true` unchanged. |
| Visual | No image changes. Cover + body paths unchanged. |
| Preview | Reused hugo on `:1313` (`-D -F --bind 0.0.0.0`). Local `http://127.0.0.1:1313/posts/green-suites-that-hid-holes/`. Tailscale: `http://mini-pro.tail86a7c7.ts.net:1313/posts/green-suites-that-hid-holes/`. |
| Git | Pushed to `draft/green-suites-that-hid-holes` only. PR stays draft. Did not merge. |

## Local-only (not committed)

- `_inbox/p11-ci-green/` (Blog pack + review-fix brief)

## Where to start next session

1. Dave review of #180. Keep draft until he says ship.
2. Do **not** set `draft = false` or merge unless asked.

## Do not

- Do not merge #180.
- Do not put private hostnames, Tailscale URLs, or creds in the post.
- Do not edit `themes/PaperMod/`.
- Do not touch main for this work.
- Do not reuse the cover as a body image.
