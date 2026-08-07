+++
title = "What I will not automate"
date = "2026-08-14T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "Boundaries for an agent production system: judgment, relationships, irreversible risk, and the work that stays human on purpose."
categories = ["Career", "AI"]
tags = ["AI agents", "governance", "TPM", "ethics", "leadership"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 6
[cover]
image = "/images/posts/boundaries-irreversible-action-gate.jpg"
alt = "Hand on a red irreversible-action gate control, with force-push, prod-destroying ops, and legal/compliance locked out"
caption = "The system declares the limits; human judgment seals the truth."
+++

This is **part 6** of the [Agent production system](/posts/agent-production-system/) series (boundaries, not “series over” — later posts dig into [GitHub tokens](/posts/github-tokens-for-agent-fleets/) and the [landing floor](/posts/landing-floor-without-a-github-app/)). Previous: [Claim safety](/posts/claim-safety-evidence-before-metrics/). Constellation: [Human approval](/about/?node=human), [Eval gates](/about/?node=eval), [Orchestrator](/about/?node=orchestrator).

---

A series about agents should spend real time on **boundaries**. Not because automation is bad — because **production systems are defined by what they refuse**.

I will automate aggressively inside the funnel. I will not pretend every human act is a waste waiting for a model. The goal was never maximum automation. The goal is a system that moves work fast **and** still has a place for a human to say no.

That is the same craft as [Xbox SLAs → agent fleets](/posts/xbox-slas-to-agent-fleets/): critical path, risk, and judgment under blast radius. Models change. The need for a hard edge does not.

## Autonomy is not “everything unattended”

Bad framing:

> If an agent *can* do it, we should automate it.

Better framing:

> For **this class of action**, under **these checks**, may an agent proceed without me — and if not, what decision brief does a human need?

Most of the funnel can still be aggressive: plans, implementation in isolation, tests, lint, routine hygiene, drafts inside evidence. Speed lives in the middle. Dignity, fairness, and irreversible risk live at the edges. That is the thesis of [human approval](/posts/human-approval-merge-button/) applied beyond the merge button.

## Non-negotiables

### 1. Final ownership of irreversible risk

Force-push to shared history, secret materialization, prod-destroying ops, public legal/compliance commitments — these stay on a **human approval** path. See [part 2](/posts/human-approval-merge-button/) and [About → Human approval](/about/?node=human).

![Hand on a red irreversible-action gate; force-push, prod-destroying ops, and public legal/compliance locked until human approval](/images/posts/boundaries-irreversible-action-gate.jpg "The system declares the limits; human judgment seals the truth")

“Irreversible” is not a vibe. It is a short list of action classes where undo is expensive, incomplete, or impossible: history rewritten, credentials exposed, data gone, a public commitment that binds more than a git revert can fix. Agents can prepare the change, package the blast radius, and wait. They do not get to decide that waiting is a bug.

### 2. Truth about people and work

Performance narratives, hiring decisions, and public credit for others’ work are not “content generation tasks.” Agents can draft a self-review bullet list or summarize a thread; humans own the relationship and the fairness.

![Agent drafting an accomplishment list on one side; two people reviewing a final performance narrative behind a relationship-and-fairness gate on the other](/images/posts/boundaries-agent-leverage-human-judgment.jpg "Agents draft; humans own the relationship and the fairness")

This is the line that separates leverage from cruelty. A model that writes a confident performance story about someone else is not “saving time.” It is laundering judgment through fluency. Same for assigning credit on a public post or internal note: if a person did the work, a person owns how that work is described when stakes are real.

### 3. Claim invention of others’ platforms

I **extend and operate** multi-agent systems and skill fleets. I will not automate — or manually write — a story that steals original authorship from upstream maintainers. Claim safety is a boundary, not a style guide ([part 5](/posts/claim-safety-evidence-before-metrics/)).

![Robot arm rewriting a README from “we built this” to “we extend and operate,” blocked by a claim-invention gate tied to verified figures](/images/posts/boundaries-claim-invention-gate.jpg "Upstream authors keep credit — operate and extend, don’t invent")

The failure mode is flattering: you ran the stack hard, so the draft says “I built.” The honest sentence is usually longer and less glamorous. Public pages, résumés, and agent-written READMEs all get the same gate — verified figures only, past-tense where true, no logo soup.

### 4. Coaching and community obligations

I am **head coach** at Harriton High School lacrosse. Athlete trust, parent communication, and competitive judgment are not batch jobs. Sports tech ([Philly Lax](https://phillylaxstats.com/), [CFB playbooks](https://davevoyles.github.io/College-Football-26-Playbooks-site)) can support the work; it does not replace the coach.

Picture a Thursday night: lineups, playing time, a hard conversation with a parent after a loss. No agent should own that path. Tools can chart stats and organize playbooks. The human still stands in the huddle.

### 5. Ambiguity that only a stakeholder can resolve

When two executives want different outcomes, a model should not pick a winner in the dark. Escalation is the feature.

This is pure TPM craft. Agents are excellent at producing a decision brief: options, risks, what each path costs, what evidence exists. They are terrible as silent tie-breakers for stakeholder conflict, because the “right” answer is often political, contractual, or relational — not a higher BLEU score. Fail closed into a human, the same way [eval gates](/posts/eval-gates-not-theater/) treat amber as “I don’t know,” not “round up to green.”

## What I *will* keep automating

Boundaries are clearer when you name the other side of the line:

| Automate hard | Keep human |
|---------------|------------|
| Boilerplate implementation inside clear specs | Irreversible or hard-to-revert actions |
| Retrieval and summarization with citations | Performance, hiring, and public credit for people |
| Test / lint / CI watch loops | Authorship and metric claims without evidence |
| Routine container and repo hygiene under gates | Coaching, athlete trust, community obligations |
| Drafting that stays inside evidence | Stakeholder conflicts only a person can resolve |

Speed belongs in the left column. Dignity and accountability belong in the right. If a task sits in the middle, default to a gate — not to “the agent seemed confident.”

## How this shows up on the constellation

If you only remember one walk through [About](/about/):

1. [Orchestrator](/about/?node=orchestrator) — holds the path  
2. [Eval gates](/about/?node=eval) — automated no  
3. [Human approval](/about/?node=human) — human no  
4. [Docker](/about/?node=docker) / [Azure](/about/?node=azure) — where it runs  

The map is the product thesis. This post is the moral of the map: agents move work; **controls and people** decide what never enters the conveyor.

Later in the series, the same boundary thinking shows up as concrete auth and landing floors — short-lived tokens, no paste-a-PAT culture, landing paths that cannot rubber-stamp themselves. Boundaries are not only ethics essays. They are implementation details that keep a fleet from eating its own trust.

## What this is not

- Not Luddism — the middle of the funnel is aggressively automated on purpose  
- Not a claim that personal agent ops equal Xbox-scale traffic  
- Not a promise that every agent action is unattended  
- Not permission to treat “wait for a human” as a defect to route around  

A well-built agent stops, states why it stopped, and hands over a decision. A poorly built one negotiates with the gate until something looks green.


**Bottom line:** the goal was never maximum automation. The goal is a **production system** — agents for leverage, gates for truth, humans for judgment. If that sounds like TPM work, good. It is.
