# Handoff

**2026-09-21 — #181 draft still open. Blog REVIEW-FIX-NONCE-IMAGES landed. Do not merge.**

## What this session did

| Work | Notes |
|------|-------|
| Copy | Replaced `content/posts/two-brains-bender-maya.md` from Blog pack. Lede: **up** = process running / light on; **nonce** = one-time code (restaurant buzzer / secret-word-through-door). Glossary: **Nonce (one-time code)** + **“Up.”** Frontmatter description: “one-time check code.” `draft = true` unchanged. |
| Visual | D1 `two-doors.png` HTML→PNG: laptop mega-agent, **Process running?**, Bender purple coding desk vs Maya indigo calendar desk, one-time code → echoed. D2 `decision.png`: **Process running** / *Running ≠ answered*; **Didn’t answer** / **No echo** / **Failed check**; tickets **Today’s code** / **Echoed back**. Cover C photoreal: two computer desks (laptop vs planner), two teal doors, stamp + blank ticket — no solder/EE. Unique cover not reused as body. |
| Preview | Reused hugo on `:1313` (`-D -F --bind 0.0.0.0`). Local `http://127.0.0.1:1313/posts/two-brains-bender-maya/` 200. Tailscale: `http://mini-pro.tail86a7c7.ts.net:1313/posts/two-brains-bender-maya/`. PNGs 200. |
| Git | Pushed to `draft/two-brains-bender-maya` only. PR stays draft. Did not merge. |

## Local-only (not committed)

- `_inbox/p12-nonce-img/` (Blog pack + review-fix brief)

## Where to start next session

1. Dave review of #181. Keep draft until he says ship.
2. Do **not** set `draft = false` or merge unless asked.

## Do not

- Do not merge #181.
- Do not put private hostnames, Tailscale URLs, or creds in the post.
- Do not edit `themes/PaperMod/`.
- Do not touch main for this work.
- Do not reuse the cover as a body image.
- Do not use Grok Bot Imagine for post art.
