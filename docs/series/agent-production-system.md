# Series: Agent production system

**Day-to-day ops (preview, draft prompts, release, images):** see the  
[**series operator card**](README.md).

A claim-safe series that expands the [case study post](/posts/agent-production-system/) and the [About constellation](/about/). Same voice: factory floor, not chatbot; verified metrics only; “extended and operates,” not invented authorship.

## Schedule (weekly, Fridays)

| # | Planned date | Slug | Status |
|---|--------------|------|--------|
| 0 | 2026-07-24 | `agent-production-system` | **Published** — series overview |
| 1 | 2026-07-31 | `eval-gates-not-theater` | Scheduled — `draft=false`, future `date` |
| 2 | 2026-08-07 | `human-approval-merge-button` | Scheduled |
| 3 | 2026-08-14 | `docker-homelab-agent-ops` | Scheduled |
| 4 | 2026-08-21 | `xbox-slas-to-agent-fleets` | Scheduled |
| 5 | 2026-08-28 | `claim-safety-evidence-before-metrics` | Scheduled |
| 6 | 2026-09-04 | `what-i-will-not-automate` | Scheduled |
| 7 | 2026-09-11 | `github-tokens-for-agent-fleets` | Scheduled — tokens / App / broker + diagram |
| 8 | 2026-09-18 | `landing-floor-without-a-github-app` | Scheduled — human mode only |

Dates are in front matter (`date`). Parts 1–8 use **`draft = false`** with future dates. Hugo excludes future content; a **daily** GitHub Actions rebuild (≈10:00 ET) ships each post after its `date` without a manual flip. Use `draft = true` only to hold a post that is not ready to auto-ship. See the [operator card](README.md).

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
