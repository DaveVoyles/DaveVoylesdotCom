+++
title = "Landing floor without a GitHub App — gates still count"
date = "2026-09-18T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "You do not need a GitHub App or bot merge to run a serious agent landing path. Human mode: Intent, CI, SHA-keyed review receipts, and a wrapper that refuses bare merges."
categories = ["Programming", "AI"]
tags = ["AI agents", "GitHub", "code review", "automation", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 8
[cover]
image = "/images/posts/agent-eval-gates.jpg"
alt = "Checkpoint gates and human console — automation with a human seat"
caption = "Bot mode is optional. Unskippable gates are not."
+++

Companion to [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/) and the [agent production system](/posts/agent-production-system/) series.

A lot of people hear “receipt-gated landing” and “GitHub App bot” as one package. They are not. **Human mode is the default** — and it is enough to stop agents from treating “please review before merge” as optional prose.

---

## The instruction that kept not working

Every agent setup eventually writes some version of:

> Before merging, run the review step.

That sentence is not a control. Under time pressure, a truncated context window, or a session optimizing for “done,” the agent can skip it and still succeed. From the outside, a merge that bypassed review looks exactly like one that did not.

If a rule matters, **it cannot live only in prose.** It has to live in code that **refuses** when the rule is broken — code the session cannot talk its way around.

That is the landing floor. A GitHub App is an *optional accelerator* for approve+merge after the same gates pass. It is not the floor.

## What human mode actually does

| Check | Why it exists |
|-------|----------------|
| **Intent** on the PR | Why this change exists — not just a diff dump |
| **CI** green | The change survived automation you already trust |
| **Review receipt on the exact HEAD SHA** | “LGTM” on commit A must not bless commit B |
| **Wrapper-only land path** | Bare `gh pr merge` is not the capability the agent has |

When App credentials are **absent**:

1. The wrapper still runs the same validations.  
2. It **does not** invent a bot approval.  
3. It prints the **exact** safe merge (or status) command for **you** to run.  
4. That is success — not a half-installed system.

| Situation | Mode |
|-----------|------|
| No App mint / no `config.env` | **Human** (default) |
| App wired and mint works | **Bot** (optional) after the same gates |

Missing App credentials is **not an error.** It is the supported path for first-time adopters and anyone who wants judgment on the final click.

## The receipt that expires by construction

A review is a claim about a **specific** code state: “I looked at *this* and found no blockers.”

If the gate only checks “is there a passing review *somewhere* on this branch?”, a new push can land under an old LGTM. The fix:

- Post the verdict as platform metadata on the **commit SHA**, not the branch name.  
- New commit → no receipt → **refuse** until review runs again.  
- Prefer a **trusted poster** for that status (even in human mode you can post receipts carefully; bot mode just automates who stamps them).

```
Push commit A → review → receipt on A
Push commit B → wrapper looks for receipt on B → none → REFUSE
Review B → receipt on B → wrapper may proceed (or print human merge)
```

Nobody has to *remember* that B invalidates A. The data model does it.

## What the agent is allowed to do

**Allowed**

- Finish the change, push, open/update the PR as the **human-linked** identity  
- Run self-review / review-lenses style work  
- Invoke the **landing wrapper**  
- Relay a clear refuse reason and fix gaps (missing Intent, red CI, stale receipt)

**Not allowed (by design)**

- Treat “I reviewed it in chat” as a merge credential  
- Call bare merge when the harness denies it  
- Skip re-review after a last-minute commit  
- Demand a GitHub App before the floor is “real”

## How this fits the series

| Post | Role |
|------|------|
| [Eval gates](/posts/eval-gates-not-theater/) | Automated checks before trust |
| [Human approval](/posts/human-approval-merge-button/) | Merge button still matters |
| [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/) | Personal vs bot credentials when you *do* add an App |
| **This post** | Full discipline **without** requiring an App |

On the constellation: [Eval gates](/about/?node=eval) and [Human approval](/about/?node=human) are the product thesis. Bot merge is a convenience layer on top.

## Minimal adoption checklist (no App)

1. One **wrapper** is the only land path the agent can invoke.  
2. Wrapper requires **Intent + CI + SHA-keyed receipt** (or your equivalent triad).  
3. On pass: print **human** merge instructions; do not soft-fail into merge.  
4. On fail: name the gap; do not ask for a PAT.  
5. Later — only if you want unattended approve+merge — add **your own** GitHub App ([token post](/posts/github-tokens-for-agent-fleets/)).

## What this is *not*

- A claim you must open-source a specific script name  
- A requirement to run unattended merges  
- Permission to skip CI because “human mode is softer”  
- A substitute for judgment on irreversible risk ([What I will not automate](/posts/what-i-will-not-automate/))

---

**Bottom line:** start with a floor the agent **cannot skip**. Stay in human mode until you *want* bot approve+merge. The App does not make the floor real — **refusal on missing receipts** does.
