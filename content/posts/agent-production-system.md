+++
title = "How I run an agent production system"
date = "2026-07-24T12:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "A claim-safe walkthrough of the multi-agent production system I operate — orchestrator, eval gates, human approval, Docker, and Azure — not a résumé timeline."
categories = ["Programming", "AI"]
tags = ["AI agents", "Docker", "Azure", "orchestration", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 0
[cover]
image = "/images/posts/agent-system-ops-floor.jpg"
alt = "Illustration of a multi-agent production system: central orchestrator hub, agent nodes, eval checks, cloud hosts, and a human approval station"
caption = "Factory floor, not chatbot: orchestrator, agents, gates, hosts, human approval."
+++

Most “AI agent” demos stop at a chat box. What I care about is the opposite: **a production system** with routing, tools, gates, hosts, and a human who still owns irreversible decisions.

This post is the written version of the interactive map on my [About page](/about/) — how the fleet is wired, what each layer is for, and what I refuse to automate.

## The mental model

Think **factory floor**, not chatbot:

1. Work arrives (a request, a board card, a plan deliverable).
2. An **orchestrator** assigns specialist agents.
3. Agents use **skills/tools** and retrieval — they don’t invent from nothing when sources exist.
4. **Eval gates** check the result (tests, policy, claim safety).
5. **Human approval** catches irreversible or high-blast-radius moves.
6. **Docker + Azure** host the runtime and cloud surface; **dashboards** show status.

That topology lives as a constellation on [About](/about/?cluster=agents). Click any node for a plain-English role, or deep-link a piece of the system (for example [`/about/?node=eval`](/about/?node=eval)).

## What each layer does

### Agents & orchestration

- **LLM router** — pick the right model or agent for cost and capability, not one vendor for everything.
- **Orchestrator** — holds the critical path; decomposes and assigns planner / coder / search work.
- **Planner / Coder / Search** — plan, implement in isolation, retrieve with citations.
- **Skills / tools + MCP** — shared craft library and structured interfaces so agents share one contract for vaults, boards, and external systems.

I **extend and operate** multi-agent platforms and skill fleets. I do **not** claim original authorship of upstream open-source agent projects I integrate.

### Gates & program control

![Eval gates and human-in-the-loop control: streams pass checkpoint arches; amber paths pause at a human console](/images/posts/agent-eval-gates.jpg)

- **Eval gates** — fail-closed automated checks before merge. Green is not theater.
- **Human approval** — hard stop when the blast radius is real (force-push, secrets, irreversible infra, ambiguous validation).

This is the TPM muscle: critical path, risk, and exec-grade judgment — applied to agent fleets instead of only human teams.

### Production hosts & web control surfaces

- **Docker host** — **20+ production containers** on a homelab I operate, including agent runtimes and supporting services, with hardened defaults.
- **Azure / ADO-style delivery** — cloud and pipeline surface where work meets real SLAs.
- **Dashboards** — web as observability and status, supporting the system rather than defining the identity.

## Practices that matter more than model choice

**Verification before trust.** Delegated agent work gets re-checked. Worktree isolation is the default so concurrent sessions don’t trample each other.

**Claim safety.** Numbers and authorship stay tied to evidence. Prefer “extended and operates” over “I invented X.” The [About](/about/) metrics and impact cards follow the same rule.

**Incident-driven hardening.** When something burns (rate limits, collisions, bad merges), the fix goes into policy and gates — not a sticky note.

**Fail-closed defaults.** Ambiguous or destructive actions escalate. Autonomy is earned per action class, not a global “agents can do anything” switch.

## How this connects to Xbox-scale work

The same execution rigor shows up in platform programs I led at Xbox/Microsoft:

- Legacy commerce retirement protecting roughly **$50M** annual revenue, zero downtime.
- Publishing pipeline re-architecture from **12 hours → 30-minute** target SLA.
- **10+ years** across Xbox, CSE, DX/DPE, and Reactor.

Agent fleets don’t replace that background — they inherit it. Shipping multi-team platform work under SLA pressure is the same muscle as shipping agent-operated changes under eval gates and human approval.

## Public artifacts

| Surface | What you’ll see |
|--------|------------------|
| [About constellation](/about/) | Interactive system map (SVG + WebGL), node details, `?cluster=` / `?node=` links |
| [Resume Builder](https://github.com/DaveVoyles/resume-builder) | Evidence-backed job-search tooling with claim discipline |
| [Philly Lax Viz](https://phillylaxstats.com/) | Production sports PWA |
| [CFB 26 Playbooks](https://davevoyles.github.io/College-Football-26-Playbooks-site) | WebGL coaching / playbook explorer |

## What this is *not*

- Not a career org chart or skill mind-map.
- Not a promise that every agent action is unattended.
- Not a dump of unverified vanity metrics.

If you only click one thing after this post, open the [agent production system map](/about/) and select **Eval gates** and **Human approval**. That’s the product thesis: agents move work; controls keep it real.

## This series

Twice-weekly deep-dives that expand this map. Status is computed at
build time from each post’s `date` — Live once that day has passed,
Scheduled until then. No hand-maintained labels.

{{< series-schedule >}}

Parts ship on their scheduled `date` (auto-publish: `draft = false` + daily rebuild). Series prev/next at the bottom of each part is generated from front matter once siblings are live. Operator schedule (slugs + dates): [`docs/series/agent-production-system.md`](https://github.com/DaveVoyles/DaveVoylesdotCom/blob/main/docs/series/agent-production-system.md).
