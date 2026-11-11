# Handoff

**2026-11-10 — Plan 0008 is in build; seven of eight deliverables are on main.** [`docs/design/0008-blog-voice-and-visuals.md`](docs/design/0008-blog-voice-and-visuals.md) makes posts read like Dave wrote them, gives figures one dark house style and puts pictures on the home page. Cards carry the `plan:0008` label. One orchestrator drives them; do not start a second.

Build tracker: progress page slug `2026-11-10-blog-voice-visuals` on the fleet page server. The link is private, so it is not written in this public repo.

## Where each deliverable stands

| Deliverable | State |
|---|---|
| D1 rewrite `advisory-pr-triage` and `per-checkout-isolation` | On main (PR 216). |
| D2 trim the 2026-11-13 post | On main (PRs 214, 218). |
| D3 variety pass on the 11-18, 11-23 and 12-03 posts | On main (PR 217). |
| D4 story-first writing standard | On main (PR 222), reviewer verdict at the head. |
| D5 voice check on pull requests, warning mode | On main (PR 215), reviewer verdict at the head. Zero findings on the six posts it covers. |
| D6 dark figure kit and cover rule | On main (PRs 221, 224, 227). |
| D7 home and post-page refresh | On main (PR 223). |
| D8 blocking gate and Grok Bot brief | Open (issue 213). Guarded. |

## Open items

- Issue 219: add a pull-request job that builds the site. Guarded.
- Reviewer nits to fold into the next Guarded pull request: `AGENTS.md` rule 7 should say figures are dark and point at the image playbook; `voice-check.yml` should pin `actions/checkout` by SHA like `setup-node`.
- The two rewritten posts have no real artifact yet (a redacted terminal line, the bot's own comment or a screenshot). Dave supplies these if he wants them; nothing is invented.
- The home hero line and the three Start here picks are proposals Dave has not yet confirmed.
- Dispatch reviewers from the top-level session; a sub-agent's reviewer dispatch stalled here (see `docs/learnings.md`).

## Live

https://davevoyles.com/

## Do not

- Do not change `date` / `draft` on any post for art/layout nits.
- Do not put private hosts / Tailscale / creds in the post.
- Do not reuse cover as a body image.
- Do not add the voice check to `make check`: the daily publish build runs it.
- Do not call a post branch ready without `make build`; pull-request checks do not build the site.
