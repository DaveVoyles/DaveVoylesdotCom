+++
title = "Human approval: the merge button still matters"
date = "2026-08-07T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "Autonomy is earned per action class. Where I keep a human on the critical path — and why that is a feature of agent production systems, not a failure of them."
categories = ["Programming", "AI"]
tags = ["AI agents", "governance", "TPM", "risk"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 2
[cover]
image = "/images/posts/agent-eval-gates.jpg"
alt = "Human-in-the-loop control at an approval console amid automated checkpoints"
caption = "Autonomy is earned. The merge button is still a product decision."
+++

This is **part 2** of the [Agent production system](/posts/agent-production-system/) series. Previous: [Eval gates are not optional theater](/posts/eval-gates-not-theater/). Constellation node: [Human approval](/about/?node=human).

---

People hear “agent fleet” and picture a fully lights-out factory. That is not what I run — and not what I want.

I run a system where **agents move the bulk of the work** and a **human still owns irreversible decisions**. The merge button (and its cousins: force-push, secrets, prod infra, public claims) is not a relic. It is a designed control.

## Autonomy is not a global boolean

Bad framing:

> Agents are autonomous: true/false.

Better framing:

> For **this class of action**, under **these checks**, may an agent proceed without me?

That is how real programs manage risk. You do not give every engineer prod root on day one. You do not give every agent an unbounded tool belt and a smile.

## What stays on the human path

I will not enumerate a classified list of every gate here — the point is the **shape**:

- **Irreversible or hard-to-revert** actions  
- **Secret and credential** surfaces  
- **Ambiguous validation** — when green would be a guess  
- **Public claims** that could misrepresent work, numbers, or authorship  
- **Cross-repo or multi-team blast radius** that outruns a single PR review

Everything else can still be aggressively automated. Speed lives in the middle of the funnel. Judgment lives at the edges.

## TPM craft, not Luddism

I spent **10+ years** at Microsoft across Xbox, CSE, DX/DPE, and Reactor. Platform work taught a boring truth: **executives do not reward “we moved fast” when the outage was preventable.**

Human approval in an agent system is the same craft as:

- Critical-path ownership  
- Risk registers that actually change behavior  
- Escalation paths that are practiced, not theoretical  

On the [constellation](/about/?node=human), human approval sits **below** eval gates for a reason: automation clears what it can; people clear what it should not.

## How agents should treat the human

Good agent behavior:

- Surfacing **why** a gate fired  
- Packaging a **decision brief**, not a guilt trip  
- Never “approving itself” by rephrasing the same session as a second reviewer  

Bad agent behavior:

- Burying risk in confidence language  
- Retrying until a check flaps green  
- Treating human delay as a bug instead of a control  

## Series

| | |
|--|--|
| ← Previous | [Eval gates are not optional theater](/posts/eval-gates-not-theater/) |
| Overview | [How I run an agent production system](/posts/agent-production-system/) |
| Next → | *Twenty-plus containers and agent-operated ops* (scheduled) |

---

**Bottom line:** if your architecture has no place for a human to say no, you did not build a production system. You built a demo with CI cosplay.
