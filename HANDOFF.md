# Handoff

**2026-11-10 — Plan 0008 is in build; three of eight deliverables are on main.** [`docs/design/0008-blog-voice-and-visuals.md`](docs/design/0008-blog-voice-and-visuals.md) makes posts read like Dave wrote them, gives figures one dark house style and puts pictures on the home page. Cards carry the `plan:0008` label. One orchestrator drives them; do not start a second.

Build tracker: progress page slug `2026-11-10-blog-voice-visuals` on the fleet page server. The link is private, so it is not written in this public repo.

## Where each deliverable stands

| Deliverable | State |
|---|---|
| D1 rewrite `advisory-pr-triage` and `per-checkout-isolation` | On main (PR 216). Dave read old against new and approved the voice. |
| D2 trim the 2026-11-13 post | On main (PRs 214, 218). |
| D3 variety pass on the 11-18, 11-23 and 12-03 posts | On main (PR 217). |
| D4 story-first writing standard | Released; edits `AGENTS.md`, so it needs a reviewer verdict. |
| D5 voice check on pull requests | PR 215 open and green; waits on a reviewer verdict. |
| D6 dark figure kit and cover rule | Released. |
| D7 home and post-page refresh | After D6. |
| D8 blocking gate and Grok Bot brief | Last. |

## Open items

- The two rewritten posts have no real artifact yet (a redacted terminal line, the bot's own comment or a screenshot). Dave supplies these if he wants them; nothing is invented.
- Figures in the two rewritten posts are still the old light cards until D6 lands.
- Issue 219: add a pull-request job that builds the site. It waits behind D5 because both touch `.github/workflows/`.

## Live

https://davevoyles.com/

## Do not

- Do not change `date` / `draft` on any post for art/layout nits.
- Do not put private hosts / Tailscale / creds in the post.
- Do not reuse cover as a body image.
- Do not add the voice check to `make check`: the daily publish build runs it.
- Do not call a post branch ready without `make build`; pull-request checks do not build the site.
