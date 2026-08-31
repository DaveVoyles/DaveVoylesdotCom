+++
title = "Landing floor without a GitHub App — gates still count"
date = "2026-08-21T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "You can lock merge without a GitHub App. The agent still has to pass checks. You still click the last button."
categories = ["Programming", "AI"]
tags = ["AI agents", "GitHub", "code review", "automation", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 8
[cover]
image = "/images/posts/landing-floor-locked-hatch.jpg"
alt = "Locked steel hatch in a dark factory floor — the landing gate that will not lift without a stamp"
caption = "If the rule matters, it lives in the lock, not in a sticky note."
+++

Companion to [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/) and the [agent production system](/posts/agent-production-system/) series.

People mix two ideas. One is a lock on merge. The other is a robot that clicks merge for you. They are not the same thing. **You can keep the last click.** That is enough to stop an agent from treating “please review” as a nice wish.

---

## The sticky note that didn’t work

Every agent setup writes some version of:

> Before merging, run the review step.

That sentence is a sticky note. It is not a lock. When the agent is in a hurry, or the chat got cut short, or it just wants to say “done,” it can skip the note. The merge still works.

Picture the last minutes of a session. Review was a line in the prompt. The agent could still run the normal merge command. From the outside, GitHub looks the same — green checks, same page. You only find out if you ask “did the lock run?” GitHub will not tell you.

If a rule matters, **it can’t live only in words.** It has to live in a program that **says no** when the rule is broken. The agent cannot talk that program into a yes.

That program is the landing floor. A GitHub App is a helper that can click merge after the same checks pass. It is extra. It is not the floor.

![A crumpled note beside an unguarded switch — a written “review first” is not a control](/images/posts/landing-floor-instruction-not-a-control.jpg "A sentence in the prompt is not a gate")

## What “you click merge” actually checks

When you click merge, four checks run. Then the agent gets one door.

| Check | Why it exists |
|-------|----------------|
| A **reason** on the pull request | So the change is not just a pile of diffs with no “why” |
| Automatic tests are **green** | The change passed the checks you already trust |
| A review **stamp on this exact version** | “Looks good” on version A must not bless version B |
| **Only one merge door** | The agent does not get the normal merge command |

**Example: the extra commit.** It’s the end of the night. The agent wants to be done. The pull request has a reason. Tests are green. It already reviewed version A, and it said so in chat. Then it pushed one more tiny change — a comment, a lock file — and the latest version is now B. From the outside, a normal merge would look fine. Chat even says it reviewed the work. Chat is not a stamp. The lock looks for a stamp on **this** version. It does not find one. It says no. It does not pretend a robot approved it. It does not ask me for a secret key. I caught it because merge is not a wish in the prompt. It’s a door the agent does not have.

When you have not set up a GitHub App:

1. The lock still runs the same checks.  
2. It **does not** pretend a robot approved the change.  
3. It prints the **exact** command for **you** to run.  
4. That is success. You did not skip a setup step.

**Example: no App, still a floor.** There’s no robot helper and no extra config file. That used to feel like I forgot something. I didn’t. The lock still wants a reason, green tests, and a stamp on this exact version. When those are there, it still does not merge. It prints the command. I click. Same checks as robot mode — no second “person” clicking for me.

| Situation | Mode |
|-----------|------|
| No robot helper / no extra config | **You click** (this is the default) |
| Robot helper is set up and works | **Robot can click** after the same checks |

A missing GitHub App is **not a broken install.** It’s the path I want for a first run, and for anyone who wants a human on the last click.

![Empty night-ops desk — the program prints the merge command; a human still makes the click](/images/posts/landing-floor-human-merge.jpg "You still click. That is success, not a half-installed robot")

## The stamp that only fits one version

A review means: “I looked at *this* pile of code and I didn’t see a blocker.”

The failure is boring. Stamp on version A. Then a “just fix the comment” push makes version B. The old “looks good” is still on the page. If the lock only asks “is there a passing review *somewhere* on this branch?”, that helpful push rides an old stamp. The fix:

- Put the stamp on the **exact version id**, not the branch name.  
- New version → no stamp → **say no** until review runs again.  

```
Push version A → review → stamp on A
Push version B → lock looks for stamp on B → none → NO
Review B → stamp on B → lock may continue (or print the command for you)
```

Nobody has to *remember* that B kills A’s stamp. The data does it.

![Two machined blocks on an inspection bench — the stamp that fits version A does not fit version B](/images/posts/landing-floor-receipt-expires.jpg "A stamp is a claim about one version")

## What the agent may do

The merge door is the program. Chat is not. A session that reviewed the diff and then offered that review as the merge pass is the same session wearing two hats. I don’t treat that as a real approval.

**Allowed**

- Finish the change, push, open or update the pull request as you  
- Run a careful self-review  
- Use the **merge door**  
- Say clearly why it said no, then fix the gap (no reason, red tests, old stamp)

**Not allowed**

- Treat “I reviewed it in chat” as a merge pass  
- Use the normal merge command when the setup blocks it  
- Skip a new review after a last-minute commit  
- Demand a GitHub App before the lock is “real”

## Where this sits in the series

This post is the lock *without* the robot. The [token post](/posts/github-tokens-for-agent-fleets/) is what you add when you *want* the robot to click.

| Post | Role |
|------|------|
| [Eval gates](/posts/eval-gates-not-theater/) | Automatic checks before you trust the change |
| [Human approval](/posts/human-approval-merge-button/) | A person still hits merge |
| [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/) | Your login vs a robot login, if you add an App |
| **This post** | The full lock **without** needing an App |

On the About picture: [Eval gates](/about/?node=eval) and [Human approval](/about/?node=human) are the idea. Robot merge is a convenience on top.

## How to start (no robot needed)

The first time I had no App, it printed a merge command. I still had to click.

1. The agent gets **one** merge door. That’s it.  
2. That door needs a **reason + green tests + a stamp on this version**.  
3. On pass: print **your** merge steps. Do not merge anyway.  
4. On fail: name the gap. Do not ask for a secret key.  
5. Later — only if you want a robot to click — add **your own** GitHub App ([token post](/posts/github-tokens-for-agent-fleets/)).

## What this is *not*

- A claim you must publish a specific script name  
- A rule that you must let a robot merge  
- Permission to skip tests because “you still click, so it’s softer”
- A substitute for judgment on irreversible risk ([What I will not automate](/posts/what-i-will-not-automate/))

---

**Bottom line:** start with a lock the agent **can’t skip**. Keep the last click until you *want* a robot to click. The App does not make the lock real. **Saying no when the stamp is missing** does.
