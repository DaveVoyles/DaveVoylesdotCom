+++
title = "From Xbox SLAs to agent fleets"
date = "2026-08-07T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "Builder-first TPM craft transfers: critical path, multi-team programs, and SLA pressure map cleanly onto eval gates, orchestration, and human approval."
categories = ["Career", "AI"]
tags = ["Xbox", "TPM", "AI agents", "SLA", "platform"]
topics = ["Tech", "Career and Students"]
series = ["Agent production system"]
series_weight = 4
[cover]
image = "/images/posts/agent-system-ops-floor.jpg"
alt = "Orchestrator-centered agent production system illustration"
caption = "Same muscle: critical path, risk, and delivery under pressure."
+++

This is **part 4** of the [Agent production system](/posts/agent-production-system/) series. Previous: [Docker homelab ops](/posts/docker-homelab-agent-ops/). Constellation: the whole [agent production map](/about/?cluster=agents) — especially [Orchestrator](/about/?node=orchestrator), [Eval gates](/about/?node=eval), and [Human approval](/about/?node=human).

---

I am a **former** Senior Technical Program Manager at Xbox/Microsoft. That sentence is past-tense on purpose — and it still explains how I design agent systems.

People hear “TPM” and picture a calendar full of status meetings. At its best, platform TPM work is the opposite of that caricature: **critical path, risk, multi-team alignment, and SLA performance** under real blast radius. Someone has to know what is actually on the path to “done,” what can kill the ship window, which teams are blocked on which contract, and when a green dashboard is lying. That is the job.

Agent fleets inherit that muscle. They do not replace it. A clever model can write a patch in thirty seconds. It cannot, by itself, own the program that decides whether the patch is allowed to touch production — and it should not be asked to.

## Verified platform stakes (not mythology)

From programs I led and stand behind on [About](/about/):

- Legacy commerce retirement protecting roughly **$50M** annual revenue, **zero downtime**
- Publishing pipeline re-architecture from **12 hours → 30-minute** target SLA
- **10+ years** across Xbox, CSE, DX/DPE, and Reactor
- Cross-team delivery across **12+ engineering groups** on high-stakes platform work

Those are not agent metrics. They are **why my agent defaults look like a program, not a playground.**

The commerce program is the clearest example. Retiring a legacy transaction path that still carried real revenue is not a “migrate when convenient” story. Every cutover step either had a hard, automatable pass/fail check, or it stopped and waited for a human with the authority to say go. Nobody shipped on “looks fine to me.” The SLA was the scoreboard; the gates were the product.

Publishing had the same shape at a different tempo. Getting a game package from “ready” to “live” was a **12h → 30m** problem: long tails, multi-team handoffs, and a publish window that did not care how confident the submitter felt. The work was not “make engineers type faster.” It was “remove every step that is not a real check, and make every real check automatic or explicitly owned.”

That is the transfer. Agents make the *typing* cheap. They do not make the *judgment* free.

## Picture this: same day, two systems

On an Xbox-scale program day, the shape looked like this:

1. A single outcome everyone could point at (“package live in the window,” “commerce path cut over with zero downtime”).
2. A critical path someone actually owned — not twelve status threads pretending ownership was shared.
3. Dependencies mapped as contracts, not vibes (“team B cannot start until API X is frozen”).
4. Risk that changed behavior — force-rank what kills the window, and put a human on anything irreversible.
5. Post-incident process change — the fix went into the playbook, not a sticky note.

On an agent production day, the shape is the same with different nouns:

1. A single work order (a board card, a plan deliverable, a scoped PR goal).
2. An **orchestrator** that holds the path until gates pass — see [Orchestrator](/about/?node=orchestrator).
3. Planner + specialist agents with clear contracts instead of one mega-prompt that does everything badly.
4. **Eval gates** for automatable checks; **human approval** for irreversible classes — [Eval](/about/?node=eval), [Human](/about/?node=human).
5. Incident-driven hardening into policy and skills when something burns (rate limits, collisions, a bad merge that almost shipped).

If you only copy the **tools** of agents and not the **governance** of platform delivery, you get novelty without reliability. Cool demos. Fragile production.

## The transfer table

| Xbox / platform TPM | Agent production system |
|---------------------|-------------------------|
| Critical path ownership | Orchestrator holds the path until gates pass |
| Multi-team dependency maps | Planner + specialist agents with clear contracts |
| SLA and publish windows | Eval gates + CI that must complete |
| Risk and go/no-go | Human approval on irreversible classes |
| Exec alignment on one outcome | Single work order → crew, not twelve chat threads |
| Post-incident process change | Incident-driven hardening into policy and skills |

Read the left column as habits you already know if you have shipped platform software under pressure. Read the right column as where those habits land when the “junior engineers with infinite energy” are models.

A few rows deserve more than a cell:

**Critical path.** In platform work, “everyone is busy” is not the same as “the path is green.” Busy teams can still be off the critical path. The same failure mode shows up in agent fleets: three agents thrashing in parallel while the one blocking merge is waiting on an ambiguous check that nobody escalated. Ownership means knowing what is actually on the path to done — and stopping work that is not.

**SLA and publish windows.** A publish window does not accept “the workflow started.” It accepts “the workflow completed and the checks that matter passed.” That is why [part 1](/posts/eval-gates-not-theater/) treats CI completion as a first-class gate: green means watched to completion, not “kicked off and walked away.” Agents are especially good at the second version of green unless you forbid it.

**Go/no-go.** Executives do not reward “we moved fast” when the outage was preventable. The merge button — and its cousins: force-push, secrets, prod infra, public claims — is the same craft as a ship review. Autonomy is earned **per action class**, not as a global boolean. That is the whole thesis of [part 2](/posts/human-approval-merge-button/).

## Builder-first is the point

I still build: homelab, agents, sports tech, coaching tools. TPM craft without builder hands goes abstract — pure process theater that engineers correctly ignore. Builder hands without program craft go fragile — clever systems that cannot survive a bad Tuesday.

The **20+ container** host layer from [part 3](/posts/docker-homelab-agent-ops/) is not a side hobby bolted onto a résumé. It is where program defaults meet runtime reality: isolation, repeatability, least privilege, and a place for agents to live that is not “my laptop session and a prayer.” Azure and pipeline surfaces are the same idea at cloud scale — delivery that has to complete under something that feels like an SLA, not a demo clock.

The series thesis in one line:

> Agents move work; **controls and critical path** keep it real — the same as shipping platform systems at scale.

## What transfers, what does not

**Transfers cleanly:**

- Holding a single critical path instead of a fog of parallel chat
- Fail-closed defaults when validation is ambiguous
- Escalation paths that are practiced, not theoretical
- Writing the incident fix into policy so the same burn does not recur
- Treating public claims as a gated surface (next post in the series)

**Does not transfer — and should not be claimed as if it does:**

- Personal agent ops are **not** Xbox global traffic
- A homelab fleet is **not** a substitute for multi-team org design at Microsoft scale
- Extending and operating open-source agent stacks is **not** original authorship of those stacks

Transfer is about **discipline**, not résumé inflation. The models will change. The need for critical path and fail-closed judgment will not.

## What I am not claiming

- That personal agent ops equal Xbox global traffic  
- That every agent action is unattended  
- Original authorship of every open-source agent stack I **extend and operate**

If a sentence makes the agent system sound more impressive than the evidence, it does not ship. That rule is the same one that kept the About metrics honest — and it is the subject of the next post in this series.


**Bottom line:** if you want agent systems that survive contact with production, hire (or become) people who have already shipped under SLA pressure. The models will change. The need for critical path and fail-closed judgment will not.
