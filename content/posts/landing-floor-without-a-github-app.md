+++
title = "The last click is still yours"
date = "2026-08-21T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "An agent writes code in a chat. A pull request is a proposed change. Merge means accepting it. A GitHub App is a robot that can click GitHub buttons for you. You can still require checks and click yourself."
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

## Words I use below

**Agent.** A program that writes and lands code for you, in a chat session.

**Pull request.** A proposed change waiting for review. On GitHub it has its own page, with a button to accept it.

**Merge.** Accepting that proposed change so it becomes part of the main project.

**GitHub App.** A robot you install on a GitHub project so it can click buttons as itself — not as you. It can approve. It can merge. People treat this robot as the “real” setup. It is not. It is extra. This post does not tell you how to install one. If you later *want* that robot, read the [token post](/posts/github-tokens-for-agent-fleets/).

**Lock.** A program that says no when a rule is broken. The agent cannot talk it into a yes. I also call this the **landing floor**.

**Stamp.** A review that applies to **one exact version** of the code. “Looks good” in chat is not a stamp.

**Automatic tests.** Checks that run by themselves when you propose a change. Green means they passed.

Those seven words are the whole toolkit. Now the point.

People mix two ideas. One is a lock on merge. The other is a GitHub App — a robot that clicks merge for you. They are not the same thing. **You can keep the last click.** That is enough to stop an agent from treating “please review” as a nice wish.

---

## The sticky note that didn’t work

Every agent setup writes some version of:

> Before merging, run the review step.

That sentence is a sticky note. It is not a lock. When the agent is in a hurry, or the chat got cut short, or it just wants to say “done,” it can skip the note. The merge still works.

Picture the last minutes of a session. Review was a line in the instructions. The agent could still run the normal merge command. From the outside, GitHub looks the same — green automatic tests, same page. You only find out if you ask “did the lock run?” GitHub will not tell you.

If a rule matters, **it can’t live only in words.** It has to live in a program that **says no** when the rule is broken.

That program is the lock. A GitHub App can click merge after the same checks pass. It is extra. It is not the lock.

![A crumpled note beside an unguarded switch — a written “review first” is not a control](/images/posts/landing-floor-instruction-not-a-control.jpg "A sentence in the prompt is not a gate")

## What “you click merge” actually checks

When you click merge, four checks run. Then the agent gets one door — the only merge path it is allowed to use.

| Check | Why it exists |
|-------|----------------|
| A **reason** on the pull request | So the change is not just a pile of diffs with no “why” |
| Automatic tests are **green** | The change passed the checks you already trust |
| A **stamp on this exact version** | “Looks good” on version A must not bless version B |
| **Only one merge door** | The agent does not get the normal merge command |

**Example: the extra commit.** It’s the end of the night. The agent wants to be done. The pull request has a reason. Automatic tests are green. It already reviewed version A, and it said so in chat. Then it pushed one more tiny change — a comment, a lock file — and the latest version is now B. From the outside, a normal merge would look fine. Chat even says it reviewed the work. Chat is not a stamp. The lock looks for a stamp on **this** version. It does not find one. It says no. It does not pretend a GitHub App approved it. It does not ask me for a secret key. I caught it because merge is not a wish in the instructions. It’s a door the agent does not have.

When you have not installed a GitHub App:

1. The lock still runs the same checks.  
2. It **does not** pretend a robot approved the change.  
3. It prints the **exact** command for **you** to run.  
4. That is success. You did not skip a setup step.

**Example: no App, still a floor.** There’s no robot helper. That used to feel like I forgot something. I didn’t. The lock still wants a reason, green automatic tests, and a stamp on this exact version. When those are there, it still does not merge. It prints the command. I click. Same checks as when a GitHub App could click — no second “person” clicking for me.

| Situation | Mode |
|-----------|------|
| No GitHub App installed | **You click** (this is the default) |
| GitHub App is installed and works | **The robot can click** after the same checks |

A missing GitHub App is **not a broken install.** It’s the path I want for a first run, and for anyone who wants a human on the last click.

![Empty night-ops desk — the program prints the merge command; a human still makes the click](/images/posts/landing-floor-human-merge.jpg "You still click. That is success, not a half-installed robot")

## The stamp that only fits one version

A review means: “I looked at *this* pile of code and I didn’t see a blocker.”

The failure is boring. Stamp on version A. Then a “just fix the comment” push makes version B. The old “looks good” is still on the page. If the lock only asks “is there a passing review *somewhere* on this proposed change?”, that helpful push rides an old stamp. The fix:

- Put the stamp on the **exact version**, not the name of the line of work.  
- New version → no stamp → **say no** until review runs again.

```
Push version A → review → stamp on A
Push version B → lock looks for stamp on B → none → NO
Review B → stamp on B → lock may continue (or print the command for you)
```

Nobody has to *remember* that B kills A’s stamp. The data does it.

![Two machined blocks on an inspection bench — the stamp that fits version A does not fit version B](/images/posts/landing-floor-receipt-expires.jpg "A stamp is a claim about one version")

## What the agent may do

The merge door is the program. Chat is not. A session that reviewed the change and then offered that review as the merge pass is the same session wearing two hats. I don’t treat that as a real approval.

**Allowed**

- Finish the change, push, open or update the pull request as you  
- Run a careful self-review  
- Use the **merge door**  
- Say clearly why it said no, then fix the gap (no reason, red tests, old stamp)

**Not allowed**

- Treat “I reviewed it in chat” as a merge pass  
- Use the normal merge command when the setup blocks it  
- Skip a new review after a last-minute change  
- Demand a GitHub App before the lock is “real”

## Where this sits in the series

This post is the lock *without* the GitHub App. The [token post](/posts/github-tokens-for-agent-fleets/) is what you add when you *want* the robot to click.

| Post | Role |
|------|------|
| [Eval gates](/posts/eval-gates-not-theater/) | Automatic tests before you trust the change |
| [Human approval](/posts/human-approval-merge-button/) | A person still hits merge |
| [GitHub tokens for agent fleets](/posts/github-tokens-for-agent-fleets/) | Your login vs a robot login, if you add a GitHub App |
| **This post** | The full lock **without** needing a GitHub App |

On the About picture: [Eval gates](/about/?node=eval) and [Human approval](/about/?node=human) are the idea. A robot that merges is a convenience on top.

## How to start (no robot needed)

The first time I had no GitHub App, the lock printed a merge command. I still had to click.

1. The agent gets **one** merge door. That’s it.  
2. That door needs a **reason + green automatic tests + a stamp on this version**.  
3. On pass: print **your** merge steps. Do not merge anyway.  
4. On fail: name the gap. Do not ask for a secret key.  
5. Later — only if you want a robot to click — add **your own** GitHub App ([token post](/posts/github-tokens-for-agent-fleets/)).

## What this is *not*

- A claim you must publish a specific script name  
- A rule that you must let a robot merge  
- Permission to skip automatic tests because “you still click, so it’s softer”  
- A substitute for judgment on irreversible risk ([What I will not automate](/posts/what-i-will-not-automate/))

---

**Bottom line:** start with a lock the agent **can’t skip**. Keep the last click until you *want* a GitHub App to click. The robot does not make the lock real. **Saying no when the stamp is missing** does.
