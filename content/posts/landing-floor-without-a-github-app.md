+++
title = "Landing floor without a GitHub App — gates still count"
date = "2026-08-21T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "You do not need a GitHub App or bot merge to run a serious agent landing path. Human mode: Intent, CI, SHA-keyed review receipts, and a wrapper that refuses bare merges."
categories = ["Programming", "AI"]
tags = ["AI agents", "GitHub", "code review", "automation", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 8
[cover]
image = "/images/posts/landing-floor-locked-hatch.jpg"
alt = "Locked steel hatch in a dark factory floor — the landing gate that will not lift without a receipt"
caption = "If the rule matters, it lives in the floor, not in the prompt."
+++

Companion to [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/) and the [agent production system](/posts/agent-production-system/) series.

A lot of people hear “receipt-gated landing” and “GitHub App bot” as one package. They are not. I kept hearing those two sold as one kit, because every demo that shows bot merge also shows the gates — so it looks like you cannot have the floor until the App exists. **Human mode is the default** — and it is enough to stop agents from treating “please review before merge” as optional prose.

---

## The instruction that kept not working

Every agent setup eventually writes some version of:

> Before merging, run the review step.

That sentence isn’t a control. Under time pressure, a truncated context window, or a session optimizing for “done,” the agent can skip it and still succeed.

Picture the last slice of a session. Review was a line in the prompt. Bare `gh pr merge` would have worked. From the outside, that merge looks exactly like one that went through the floor — same green checks, same PR page. You only find out because you asked whether the wrapper ran, not because GitHub looked different.

If a rule matters, **it can’t live only in prose.** It has to live in code that **refuses** when the rule is broken — code the session cannot talk its way around.

That is the landing floor. A GitHub App is an *optional accelerator* for approve+merge after the same gates pass. It is not the floor.

![A crumpled note beside an unguarded switch — a written “review first” is not a control](/images/posts/landing-floor-instruction-not-a-control.jpg "A sentence in the prompt is not a gate")

## What human mode actually does

| Check | Why it exists |
|-------|----------------|
| **Intent** on the PR | Why this change exists — not just a diff dump |
| **CI** green | The change survived automation you already trust |
| **Review receipt on the exact HEAD SHA** | “LGTM” on commit A must not bless commit B |
| **Wrapper-only land path** | Bare `gh pr merge` is not the capability the agent has |

**Example: the extra commit.** It’s the end of the session and the agent is optimizing for “done.” Intent is on the PR. CI is green. It already ran a review on commit A, and it even said so in chat. Then it pushed one more commit — a comment, a lockfile, something that felt too small to re-review — and HEAD is now B. From the outside, bare `gh pr merge` would look exactly like a landing that went through the floor. Chat even says it reviewed the change. That’s not a credential. The wrapper looks for a receipt on **this** SHA, doesn’t find one, and refuses. It names the gap. It does not invent a bot approval. It does not ask for a PAT. I didn’t catch it because the PR page looked ready. I caught it because merge isn’t a prompt instruction in this setup. It’s a path the agent doesn’t have.

When App credentials are **absent**:

1. The wrapper still runs the same validations.  
2. It **does not** invent a bot approval.  
3. It prints the **exact** safe merge (or status) command for **you** to run.  
4. That is success — not a half-installed system.

**Example: no App, still a floor.** There’s no App mint and no `config.env`. That used to feel like I’d skipped a setup step. It isn’t. The wrapper still checks Intent, still waits for CI, still wants a receipt on the exact HEAD SHA. When those are there, it does not invent a bot approval and it does not merge. It prints the exact command for me. I still make the click. That’s human mode succeeding — same gates as bot mode, no second principal. If the agent tries bare merge anyway, the harness doesn’t have that capability; the wrapper is the land path.

| Situation | Mode |
|-----------|------|
| No App mint / no `config.env` | **Human** (default) |
| App wired and mint works | **Bot** (optional) after the same gates |

Missing App credentials is **not an error.** It’s the supported path for a first run and for anyone who wants judgment on the final click.

![Empty night-ops desk — the wrapper prints the merge command; a human still makes the click](/images/posts/landing-floor-human-merge.jpg "Human mode is success, not a half-installed bot")

## The receipt that expires by construction

A review is a claim about a **specific** code state: “I looked at *this* and found no blockers.”

Receipt on commit A. Then a “just fix the comment” push to B. The old LGTM is still sitting on the PR. If the gate only asks whether a passing review exists *somewhere* on this branch, that helpful push lands under a stamp that was never about B. The fix:

- Post the verdict as platform metadata on the **commit SHA**, not the branch name.  
- New commit → no receipt → **refuse** until review runs again.  
- Prefer a **trusted poster** for that status (even in human mode you can post receipts carefully; bot mode just automates who stamps them).

```
Push commit A → review → receipt on A
Push commit B → wrapper looks for receipt on B → none → REFUSE
Review B → receipt on B → wrapper may proceed (or print human merge)
```

Nobody has to *remember* that B invalidates A. The data model does it.

![Two machined blocks on an inspection bench — the stamp that fits commit A does not fit commit B](/images/posts/landing-floor-receipt-expires.jpg "A receipt is a claim about one SHA")

## What the agent is allowed to do

The wrapper is the capability. Chat is not. A session that reviewed the diff and then offered that review as the merge credential is the same session wearing a second hat. I don’t treat that as an approval identity.

**Allowed**

- Finish the change, push, open/update the PR as the **human-linked** identity  
- Run a structured self-review pass  
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

**Bottom line:** start with a floor the agent **can’t skip**. Stay in human mode until you *want* bot approve+merge. The App does not make the floor real — **refusal on missing receipts** does.
