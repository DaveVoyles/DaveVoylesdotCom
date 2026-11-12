# Handoff

**2026-11-11 — Plan 0008 is done; all eight deliverables are on main.** [`docs/design/0008-blog-voice-and-visuals.md`](docs/design/0008-blog-voice-and-visuals.md) ends with an Outcome table that says where each one landed. No pull request or `plan:0008` issue is open.

## What is different now

- **Writing:** the story-first standard is in [`docs/authoring-guide.md`](docs/authoring-guide.md). `advisory-pr-triage` and `per-checkout-isolation` are the approved examples of the voice.
- **Voice check:** a pull request that touches a post dated 2026-11-01 or later fails on a finding (`make check-voice` locally). A post opts out with `voice_exempt` plus `voice_exempt_reason`. It is not part of `make check` and cannot stop the daily publish.
- **Site build check:** every pull request builds the site, so invalid front matter fails before merge.
- **Figures and covers:** dark, from [`docs/figure-kit/`](docs/figure-kit/); covers are one object, no words, 16 by 9. Rules and who does what are in [`docs/image-playbook.md`](docs/image-playbook.md).
- **Home page:** one-line hero with avatar, a Start here row and a thumbnail on each recent post.

## Since the plan closed (2026-11-11)

- CodeRabbit's automatic review is off in `.coderabbit.yaml` (it skipped every pull request and posted a notice each time). A review can be asked for by hand on one pull request.
- Post pages on a phone: the content comes first and the bio card follows; the contents rail is desktop only (ADR 0006 amended).
- Grok Bot's vault note change for D4 was read and matches what it reported.

## Open items (none blocks anything)

- The home hero line and the three Start here picks shipped as proposals; Dave has not confirmed them.
- The two rewritten posts have no real artifact yet (a redacted terminal line, the bot's own comment or a screenshot). Dave supplies these; nothing is invented.
- The `summary` and `define` shortcodes are unused so far.
- One success signal is still unmeasured: Grok Bot's first draft passing the voice check without a human rewrite.
- `tests-that-never-ran` was rewritten to the story-first standard after the plan closed (pull request 236, issue 235). It predates the voice check's cutoff, so the pull-request voice job does not cover it.

## Live

https://davevoyles.com/

## Do not

- Do not change `date` / `draft` on any post for art/layout nits.
- Do not put private hosts / Tailscale / creds in the post.
- Do not reuse cover as a body image.
- Do not add the voice check to `make check`: the daily publish build runs it.
- Dispatch reviewers for Guarded pull requests from the top-level session (see `docs/learnings.md`).
