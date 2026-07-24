# Claim-safe facts (davevoyles.com)

**Single source of truth for public claims on this site.**  
Agents: if a number, title, or product authorship claim is not on this page (or explicitly approved by Dave in-session), **do not invent it**.

Canonical external evidence (when available on disk):

- `~/REPOS/resume-builder-Dave/docs/candidate-profile.md`
- `~/REPOS/resume-builder-Dave/docs/accuracy-and-claims.md` (or sibling paths Dave uses)

If those files and this page disagree, **stop and ask** — do not silently pick one.

---

## Identity

| Fact | Use this language |
|------|-------------------|
| Role | **Former** Senior Technical Program Manager at Xbox / Microsoft (past tense) |
| Location | Philadelphia, PA · Remote-US |
| Positioning | Builder-first TPM; agent production systems with real controls, not demo-only chatbots |

Do **not** write “Senior TPM at Xbox” as a present-tense current employer claim.

---

## Allowed metrics (public)

Use only these (or softer paraphrases that do not inflate them):

| Metric | Canonical form | Context |
|--------|----------------|---------|
| Microsoft tenure | **10+** years | Xbox, CSE, DX/DPE, Reactor |
| Commerce / modernization | **~$50M** annual revenue | Xbox 360 commerce retirement, zero downtime framing |
| Publishing pipeline | **12h → 30m** | Xbox game package publish SLA target |
| Homelab | **20+** Docker containers | Agent-operated host; hardened defaults |

Do not invent new dollar amounts, headcount, latency, or “N agents in production” stats.

---

## Skills / tech — in vs out

**Lead with:** AI agents & orchestration, evals, human approval, MCP, multi-LLM routing.

**OK to claim familiarity / ops:** Azure, Docker, GitHub, agent-governed CI, WebGL / data viz (as Web support), Xbox platform experience (past).

**Do not list as confidence claims / logo soup:** Terraform, Kubernetes / K8s (even if a mock resume once showed them).

---

## Agent platforms — authorship

| Language | Allowed? |
|----------|----------|
| “Extended and operates OpenClaw / Hermes / firstmate” | Yes |
| “Integrated and operates …” | Yes |
| “I built / created / authored OpenClaw (or Hermes / firstmate)” | **No** |
| Invented fork names, user counts, or “my framework” for upstream tools | **No** |

---

## About constellation node ids

Deep links: `/about/?node=<id>` and `/about/?cluster=<cluster>`.

| id | Label (approx) | cluster |
|----|----------------|---------|
| `orchestrator` | Orchestrator | agents |
| `planner` | Planner | agents |
| `coder` | Coder | agents |
| `search` | Search | agents |
| `router` | Router | agents |
| `skills` | Skills | agents |
| `eval` | Eval gates | agents |
| `mcp` | MCP | agents |
| `docker` | Docker host | production |
| `azure` | Azure / ADO | production |
| `dashboard` | Dashboards | production |
| `human` | Human approval | program |

Clusters: `agents` · `web` · `program` · `production`.  
Do not invent node ids; if the map needs a new node, update `content/about.md` constellation data and this table together.

---

## Topics vocabulary (posts)

Only these `topics` values (multi-ok):

1. `Gaming`
2. `Tech`
3. `AI and Agents`
4. `Public Speaking and Presentations`
5. `Career and Students`
6. `Journalism and Marketing and PR`

---

## Series schedule (Agent production system)

See [`docs/series/agent-production-system.md`](series/agent-production-system.md).  
Publish model: `draft = false` + future `date` + daily Hugo rebuild ([`docs/series/README.md`](series/README.md)).
