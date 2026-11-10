# Handoff

**2026-11-10 — Plan 0008 approved by Dave, build starting.** [`docs/design/0008-blog-voice-and-visuals.md`](docs/design/0008-blog-voice-and-visuals.md) has eight deliverables to make posts read like Dave wrote them, give figures one dark house style and put pictures on the home page. Cards carry the `plan:0008` label. One orchestrator drives them; do not start a second.

Plan page (becomes the build tracker): progress page slug `2026-11-10-blog-voice-visuals` on the fleet page server. The link is private, so it is not written in this public repo.

## Time-sensitive

- D2 trims the post that publishes 2026-11-13 08:00 ET. It has a hard stop at the end of 2026-11-12; after that the post ships as written.

## What the audit found (short)

- `advisory-pr-triage` (score 32) and `tests-that-never-ran` (22) fail the tells checker's threshold of 20; the four scheduled posts pass (13 to 18).
- All nine Post Standard checklist items are verbatim headings in `advisory-pr-triage`.
- Most figures are light cards on the dark site; covers come in four aspect ratios.
- The home page shows no images.

## Live

https://davevoyles.com/

## Do not

- Do not change `date` / `draft` on any post for art/layout nits.
- Do not put private hosts / Tailscale / creds in the post.
- Do not reuse cover as a body image.
- Do not add the voice check to `make check`: the daily publish build runs it.
