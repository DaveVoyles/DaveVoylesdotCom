# Series: Agent production system

A claim-safe series that expands the [case study post](/posts/agent-production-system/) and the [About constellation](/about/). Same voice: factory floor, not chatbot; verified metrics only; “extended and operates,” not invented authorship.

## Schedule (weekly, Fridays)

| # | Planned date | Slug | Status |
|---|--------------|------|--------|
| 0 | 2026-07-24 | `agent-production-system` | **Published** — series overview |
| 1 | 2026-07-31 | `eval-gates-not-theater` | Draft ready |
| 2 | 2026-08-07 | `human-approval-merge-button` | Draft ready |
| 3 | 2026-08-14 | `docker-homelab-agent-ops` | Draft ready |
| 4 | 2026-08-21 | `xbox-slas-to-agent-fleets` | Draft ready |
| 5 | 2026-08-28 | `claim-safety-evidence-before-metrics` | Draft ready |
| 6 | 2026-09-04 | `what-i-will-not-automate` | Draft ready |
| 7 | 2026-09-11 | `github-tokens-for-agent-fleets` | Draft ready — tokens / App / broker |

Dates are in front matter (`date`). All unpublished posts use `draft = true` so they never ship early.

### Companion sources (private → public)

Part 7 is distilled from Chat-Agents public patterns + auth runbook (do not paste secrets into the site):

- `Chat-Agents/docs/public/pattern-credential-broker.md`
- `Chat-Agents/docs/public/setup-github-app-landing-floor.md`
- `Chat-Agents/docs/public/pattern-bot-identity-landing-floor.md`
- `Chat-Agents/docs/github-auth.md`
- `Chat-Agents/docs/github-tokens-chat-agents.html` (archify diagram)

## How to release one

```bash
# From repo root — flips draft off and sets date to now (ET-friendly)
./scripts/release-series-post.sh eval-gates-not-theater
git add content/posts/eval-gates-not-theater.md
git commit -m "publish: eval gates post (series 1)"
git push origin main
```

Or manually: open the post, set `draft = false`, adjust `date` if needed, commit, push.

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
