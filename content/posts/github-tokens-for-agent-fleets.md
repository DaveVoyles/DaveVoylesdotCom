+++
title = "Don't paste your GitHub key in chat"
date = "2026-08-18T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "An agent writes code in a chat. A pull request is a proposed change. A GitHub App is a robot that clicks as itself. Give it a short-lived key. Do not paste a long-lived key in the chat."
categories = ["Programming", "AI"]
tags = ["AI agents", "GitHub", "security", "automation", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 7
[cover]
image = "/images/posts/github-tokens-pat-in-chat.jpg"
alt = "A long-lived access key left exposed on an open laptop in a dark ops room"
caption = "Agents do not get a long-lived key in chat."
+++

Companion to [The last click is still yours](/posts/landing-floor-without-a-github-app/) and the [agent production system](/posts/agent-production-system/) series.

## Words I use below

**Agent.** A program that writes and lands code for you, in a chat session.

**Pull request.** A proposed change waiting for review. On GitHub it has its own page, with a button to accept it.

**Merge.** Accepting that proposed change so it becomes part of the main project.

**Personal login.** You, signed in as yourself. When you type commands, GitHub sees your name.

**GitHub App.** A robot you install on a GitHub project so it can click buttons as itself — not as you. It can approve. It can merge.

**Short-lived token.** A temporary key the robot gets to prove it may click. It dies in about an hour. After that it is junk.

**PAT.** A personal access token. A long-lived key tied to *you*. If it leaks into a chat log, it keeps working until someone turns it off.

**Broker.** A small program that hands out a short-lived token when the rules say yes. The agent asks. The broker decides. The agent does not invent a key.

Those eight words are the whole toolkit. Now the point.

People mix two keys. One is yours. The other is a short key for a robot. They are not the same thing. **Agents ask a broker for a short-lived token. They do not get a PAT in chat.**

---

## The paste that keeps working

Most demos treat GitHub as: paste a PAT into the chat and hope. That works until the key shows up in a transcript. Or until the robot opens a pull request and GitHub refuses to let it approve its own change.

Picture the last minutes of a session. Something failed with “not allowed.” The agent asks you to paste a new key. You paste a PAT. Now the key lives in the chat forever. The chat is a file on disk. That is not a secret anymore.

If a key matters, **the agent does not get to see the long one.**

**Example: the not-allowed paste.** It’s late. The robot’s short-lived token died. GitHub said no. The agent does not ask the broker for a new one. It asks you for a PAT. You paste it. Tomorrow that chat is in a log. The PAT still works. Nobody turned it off, because nobody thought of the log as a key ring.

That is the failure this post is about. Not “agents cannot use GitHub.” They can. They just do not get *your* long key.

![Agent asks a broker, the broker hands a short-lived token to a GitHub App, and a separate personal login opens the pull request](/images/posts/github-tokens-agent-system.png)

*One GitHub App. Many short-lived tokens. Agents ask the broker. They do not each own a PAT. Machine secrets stay out of git.*

## Two names on purpose

Think of two lanes:

| Lane | Who GitHub sees | How long the key lasts | Used for |
|------|-----------------|------------------------|----------|
| **You** | Your personal login | Until you sign out | Work *you* are doing: open a pull request, poke around, push as yourself |
| **Robot** | A GitHub App | About one hour | Approve and merge after the checks pass |

![Two industrial lanes — a worn personal key on one track, a short-lived fuse on the other](/images/posts/github-tokens-two-lanes.jpg "You open the pull request. The robot only merges after the checks.")

Look at a normal afternoon. Work is moving. Nothing sits in the middle waiting for someone to *feel* that a key was fine. The broker already said yes or no. Empty waiting is not a stall. It is the rule doing its job.

![A factory board whose middle slot is empty on purpose — nothing waits there for a vibe check](/images/posts/github-tokens-empty-review.jpg "Nothing waits there for a vibe check")

Agents do **not** each own a GitHub App. They call one broker. That broker talks to **one** App. It gets a short-lived token. It throws the token away when done.

**You** stay on your personal login. **The robot** stays on the GitHub App. Mix them and you get a boring failure: the robot opened the pull request, so GitHub will not let that same robot approve it.

### Rule that saves pain

**Opening a pull request stays on your personal login.**
**Approve and merge after checks can use the robot.**

**Example: the robot that cannot approve itself.** You were hitting a limit on your personal login. So you let the GitHub App *open* the pull request. GitHub now thinks the robot wrote the change. At the end of the night a script asks the same robot to approve it. GitHub says no. Same name cannot approve its own work. You find out when you wanted to be done. Keep create on your name. Wait out the limit if you have to. Do not “fix” a limit by handing the robot the first click.

## A program hands out the key

I do not let the agent talk its way into a key. The broker is plain code with a fixed list of answers:

1. **Request** — what it wants to do, which project.
2. **Policy in code** — a small key by default. A wide key is a no.
3. **One of:**
   - **GRANT** — a short-lived token on the way out (never written into a log as the secret).
   - **DENY** — a structured no: what blocked it, what to try next.
4. **Audit line** — who / what / when / yes-or-no. Never the token value.

The caller can be an agent. The decision cannot. That is the same idea as [eval gates](/posts/eval-gates-not-theater/): a security line is not a paragraph the model can rewrite.

If the agent decides “I need every button, hand me something wide,” you already lost. If you paste a PAT into chat every time something says no, you lost the log *and* the safety.

### What to try before asking a human for a PAT

When GitHub says no, the agent should not open with “please paste a new PAT.”

1. Is the **right name** in use for this kind of work? Your personal login opens the pull request. The robot does the later clicks.
2. For the robot: **ask the broker again.** An hourly token *looks* dead when it is only expired.
3. Does the GitHub App even cover this project with the buttons you need? A missing permission is not fixed by asking harder.
4. Only then bother a human — and still not with “paste a PAT.”

Asking a human for a brand-new long-lived key is a last resort (new machine, missing robot key). It is not the default.

## The robot is extra. The checks are not.

This post is the key. The other post is a **lock** — a program that says no when a rule is broken. I will not walk it here. Read [The last click is still yours](/posts/landing-floor-without-a-github-app/).

One fact carries over: a missing GitHub App is **not a broken install.** The checks still run. If the robot is there, it may click after they pass. If not, you click.

| Mode | GitHub App set up? | What happens |
|------|--------------------|--------------|
| **You click** (default) | No | Checks run; print the merge steps for you |
| **Robot can click** | Yes | Same checks; then the robot can approve and merge |

Automation should not mean “merge anything that compiled.” The robot is a **narrow** second name, not a second you with every button forever. That pairs with [human approval](/posts/human-approval-merge-button/): merge is still a product decision.

## Small keys

Give the GitHub App only the buttons it needs:

| Button | Why the robot has it |
|--------|----------------------|
| Pull requests: read and write | So it can approve |
| Project files: read and write | So it can merge |
| Status marks: read and write | So it can see that review happened |

The robot’s private key lives **outside any git repo**. Never commit it.

When you check that the broker handed out a token, print the **length**, not the key:

```bash
# Length only — do not echo the token into chat or logs
TOKEN="$(broker-or-mint …)"
echo "mint ok, length=${#TOKEN}"
unset TOKEN
```

## Where this sits in the series

This post is the key. The other post is the lock *without* needing the robot.

| Post | Role |
|------|------|
| [Eval gates](/posts/eval-gates-not-theater/) | Automatic tests before you trust the change |
| [Human approval](/posts/human-approval-merge-button/) | A person still hits merge |
| **This post** | Your login vs a robot login, if you add a GitHub App |
| [The last click is still yours](/posts/landing-floor-without-a-github-app/) | The lock **without** needing a GitHub App |

On the About picture: [Eval gates](/about/?node=eval) and [Human approval](/about/?node=human) are the idea. A robot that merges is a convenience on top.

## How to start

1. Agents do **not** get a PAT in chat.
2. Your **personal login** opens the pull request.
3. A **broker** hands a short-lived token to the GitHub App when you want the robot to click.
4. No GitHub App yet? That is fine. You still click. Read [The last click is still yours](/posts/landing-floor-without-a-github-app/).
5. If GitHub says no: right name, ask the broker again, check the install. Do not ask for a PAT.

## What this is *not*

- A recommendation to paste PATs into agent chats
- A claim that a robot must merge
- A dump of private runbook internals or live keys
- Permission to skip review because “the robot said so”
- The lock story — that is the [other post](/posts/landing-floor-without-a-github-app/)

---

**Bottom line:** agents get a path to a short-lived token. They do not get a PAT in chat, and they do not merge without the checks.
