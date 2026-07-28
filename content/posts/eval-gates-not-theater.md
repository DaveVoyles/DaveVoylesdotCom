+++
title = "Eval gates are not optional theater"
date = "2026-07-28T09:00:00-04:00"
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

Demo agents look smart until they touch a real repo. In a demo, the agent writes the code, the code runs once, everyone claps. Nobody checks what happens the second time, or the tenth, or the time the agent decides the fastest way past a failing test is to delete the test. Then you learn the hard lesson: **intelligence without a gate is just a faster way to ship a bad change.**

In my agent production system, eval gates sit after the fleet does work and **before** anything is trusted as done. They are not a slide bullet, and they are not a "we'll add tests later" afterthought. They are the product surface that turns "the agent tried" into "this is allowed to merge." If you strip everything else out of an agent system — the routing, the skills, the fancy dashboards — and keep only the gate, you still have a system you can trust more than you can trust the model's own confidence.

## What a gate is for

A gate answers one question:

> Given this change, under our rules, is it safe enough to proceed — or must a human decide?

That is a **program** question as much as a **code** question. It's the same muscle I used running an Xbox publishing pipeline, where getting a game package from "ready" to "live" was a **12h → 30m** SLA problem: every step either had a hard, automatable pass/fail check, or it stopped and waited for a human with the authority to say yes. Nobody shipped on "looks fine to me." The gate didn't care how confident the person (or now, the agent) submitting the change felt. It cared what the checks said.

Agents make that discipline more important, not less. A human engineer who cuts a corner usually knows they cut it. An agent that cuts a corner will describe the result with exactly the same confident tone as a job done right — it has no signal that tells it "this one's shaky." The gate is the thing that supplies that signal from the outside, since the agent won't supply it from the inside.

## What runs in the gate (conceptually)

I keep the list boring on purpose. Boring is the point — a gate that needs a PhD to understand is a gate nobody will trust in a 2am incident:

- **Tests and lint** — the change does what it claims in automation, not only in chat. If the agent says "I fixed it," the test suite is the thing that gets to agree or disagree, not the agent's own summary.
- **Policy / safety lists** — destructive or irreversible classes of action (force-pushes, dropped tables, secret rotation, anything with `--force` in the name) do not sneak through as "just another commit." They're routed to a human by rule, not by hoping the agent remembers to ask.
- **Claim safety** — public-facing numbers and authorship language stay aligned with evidence, not with whatever sounds most impressive in the moment (more on this in a later post in this series).
- **CI completion** — green means watched to completion, not "started a workflow and walked away." A run that's still in progress is not a passed check; it's an open question.

None of that requires a magic model. It requires treating agents like junior engineers with infinite energy and imperfect judgment: **verify, then trust.** The same 20+-container homelab I run agents against day to day has this same shape at a smaller scale — nothing an agent does to that host counts as "done" until the gate that watches it says so, because the host doesn't get a do-over if the gate is wrong.

## Fail-closed beats fail-open

Fail-open feels productive for a week. Everything moves fast, the agent looks brilliant, and you start believing the gate was mostly ceremony anyway. Then one ambiguous validation slips through — a test that silently skipped instead of failing, a check that returned "unknown" and got treated as "fine" — and you spend a month rebuilding trust that took years to build the first time. Fail-open doesn't announce itself as a mistake. It just quietly erodes the thing you actually needed, which was confidence that green means green.

Fail-closed defaults flip that bet:

- If validation is **ambiguous**, escalate — do not invent a green. An unclear result is not a passing result wearing a disguise.
- If the action is on a **hard-gated list**, stop for a human, full stop, no matter how routine the agent thinks the change is.
- If two agents race the same tree, **isolation** (worktrees, claim locks) is part of the gate story, not an afterthought bolted on after the first collision.

## Gate states, in practice

Not every gate outcome is pass/fail. In my system it's closer to a traffic light, and the middle state is doing most of the real work:

| State | What it means | What happens next |
|-------|----------------|--------------------|
| Green | Every automated check passed, nothing on the hard-gated list | Proceeds without a human in the loop |
| Amber | A check is ambiguous, missing, or borderline | Pauses for a human decision — never auto-resolves to green |
| Red | A check failed, or the action hit a hard-gated policy | Stops. The agent gets the failure back, a human gets notified |

The whole point of amber is that it exists at all. A system with only green and red will eventually get pushed, by an agent optimizing for throughput, into calling a genuinely ambiguous result "green" because "red" felt too harsh. Amber gives the system an honest place to put "I don't know" instead of rounding it up.

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
