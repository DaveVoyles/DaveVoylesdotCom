+++
title = "Eval gates are not optional theater"
date = "2026-07-31T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "Automated checks before merge — tests, policy, claim safety — are the product, not a checkbox. How eval gates fit an agent production system."
categories = ["Programming", "AI"]
tags = ["AI agents", "evals", "CI", "claim safety", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 1
[cover]
image = "/images/posts/agent-eval-gates.jpg"
alt = "Illustration of eval checkpoint arches with human-in-the-loop control"
caption = "Green continues. Amber pauses. Theater is when everything is green by default."
+++

This is **part 1** of the [Agent production system](/posts/agent-production-system/) series. Start with the [system map](/posts/agent-production-system/) if you haven’t read it yet. On the interactive diagram: [Eval gates](/about/?node=eval).

---

Demo agents look smart until they touch a real repo. Then you learn the hard lesson: **intelligence without a gate is just a faster way to ship a bad change.**

In my agent production system, eval gates sit after the fleet does work and **before** anything is trusted as done. They are not a slide bullet. They are the product surface that turns “the agent tried” into “this is allowed to merge.”

## What a gate is for

A gate answers one question:

> Given this change, under our rules, is it safe enough to proceed — or must a human decide?

That is a **program** question as much as a **code** question. Same muscle as an Xbox publishing pipeline: SLA, critical path, and fail-closed defaults when the blast radius is real.

## What runs in the gate (conceptually)

I keep the list boring on purpose:

- **Tests and lint** — the change does what it claims in automation, not only in chat.
- **Policy / safety lists** — destructive or irreversible classes of action do not sneak through as “just another commit.”
- **Claim safety** — public-facing numbers and authorship language stay aligned with evidence (more in a later post in this series).
- **CI completion** — green means watched to completion, not “started a workflow and walked away.”

None of that requires a magic model. It requires treating agents like junior engineers with infinite energy and imperfect judgment: **verify, then trust.**

## Fail-closed beats fail-open

Fail-open feels productive for a week. Then one ambiguous validation slips through and you spend a month rebuilding trust.

Fail-closed defaults:

- If validation is **ambiguous**, escalate — do not invent a green.
- If the action is on a **hard-gated list**, stop for a human.
- If two agents race the same tree, **isolation** (worktrees, claim locks) is part of the gate story, not an afterthought.

## Theater vs. real gates

| Theater | Real gate |
|--------|-----------|
| A checkbox the agent ticks itself | A check the agent cannot waive |
| “Looks good to me” in the same session | Independent re-run or separate approval path |
| Metrics without evidence | Numbers tied to a source of truth |
| Always green dashboards | Amber and red that actually block |

If your eval never fails, you do not have evals — you have decoration.

## How this maps to the constellation

On [About](/about/?node=eval):

- Work flows from **orchestrator / coder** into **eval**.
- Eval connects forward to **human approval** and **dashboards**.
- Production hosts (**Docker**, **Azure**) are where the same discipline shows up as runtime and pipeline reality.

Click the node if you want the one-line version. This post is the long version.


**Bottom line:** agents move work; **gates decide whether work counts.** If you only invest in smarter models and never in harder gates, you are optimizing the wrong half of the system.
