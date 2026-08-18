# Series: Agent production system

**Day-to-day ops (preview, draft prompts, release, images):** see the  
[**series operator card**](README.md).

A claim-safe series that expands the [case study post](/posts/agent-production-system/) and the [About constellation](/about/). Same voice: factory floor, not chatbot; verified metrics only; “extended and operates,” not invented authorship.

## Schedule (twice weekly, Tuesdays and Fridays)

Changed from weekly-Fridays-only on 2026-07-27 — doubled cadence going
forward compresses the remaining backlog into half the calendar time.

| # | Planned date | Day | Slug |
|---|--------------|-----|------|
| 0 | 2026-07-24 | Fri | `agent-production-system` |
| 1 | 2026-07-28 | Tue | `eval-gates-not-theater` |
| 2 | 2026-07-31 | Fri | `human-approval-merge-button` |
| 3 | 2026-08-04 | Tue | `docker-homelab-agent-ops` |
| 4 | 2026-08-07 | Fri | `xbox-slas-to-agent-fleets` |
| 5 | 2026-08-11 | Tue | `claim-safety-evidence-before-metrics` |
| 6 | 2026-08-14 | Fri | `what-i-will-not-automate` |
| 7 | 2026-08-18 | Tue | `github-tokens-for-agent-fleets` |
| 8 | 2026-08-21 | Fri | `landing-floor-without-a-github-app` |

**Do not put Live / Scheduled in this table.** That label rots the day a
post ships. Dates live in each post’s `date`. The public table on
[How I run an agent production system](/posts/agent-production-system/)
computes Live vs Scheduled at Hugo build time from those dates, so the
daily Pages rebuild flips a row without anyone editing markdown.

Machine copy of the same rows: `data/series/agent-production-system.yaml`
(regenerate with `python3 scripts/sync-series-schedule.py`; `make check`
fails if it drifts from `content/posts/`).

Parts use **`draft = false`** + the planned `date`. Hugo excludes future
content; a **daily** GitHub Actions rebuild (≈10:00 ET) ships each post
after its `date`. Use `draft = true` only to hold a post that is not
ready. See the [operator card](README.md).

### Companion sources (private → public)

Parts 7–8 are distilled from Chat-Agents public patterns + auth runbook (do not paste secrets into the site):

- `Chat-Agents/docs/public/pattern-credential-broker.md`
- `Chat-Agents/docs/public/setup-github-app-landing-floor.md`
- `Chat-Agents/docs/public/pattern-bot-identity-landing-floor.md`
- `Chat-Agents/docs/public/flagship-receipt-gated-landing-floor.md`
- `Chat-Agents/docs/github-auth.md`
- `Chat-Agents/docs/github-tokens-chat-agents.html` → exported PNG at `static/images/posts/github-tokens-agent-system.png`

## How release works

**Scheduled (default):** leave `draft = false` and the planned `date`. The daily Pages rebuild publishes automatically once the date has passed. Preview locally with `hugo server -F`.

**Ship early:** set `date` to now (or run `./scripts/release-series-post.sh <slug>` if it was still a draft), commit, push `main`.

## Claim rules (do not drift)

- Verified numbers only: 10+ years MS, ~$50M commerce, 12h→30m publish SLA, 20+ containers.
- Prefer “extend and operate” for agent platforms; no original-authorship claims for upstream open-source agents.
- No Terraform/K8s as confidence claims.
- Link to `/about/?node=…` and `/about/?cluster=…` when a constellation node is the star.

## Arc

1. **Map** — whole system (done)  
2. **Gates** — automated controls  
3. **Human** — where autonomy stops  
4. **Host** — Docker / production ops  
5. **Transfer** — Xbox TPM muscle → agent fleets  
6. **Evidence** — claim safety in public artifacts  
7. **Boundaries** — what stays human forever  

## Optional later

- Per-post cover images (Grok Imagine) matching each theme  
- Home “series” strip once 3+ are live  
- LinkedIn carousel of one line + About deep link per release  
