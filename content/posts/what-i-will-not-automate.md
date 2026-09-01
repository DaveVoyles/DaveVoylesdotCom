+++
title = "What I will not automate"
date = "2026-08-14T09:00:00-04:00"
draft = false
author = "Dave Voyles"
description = "An agent is a program that writes code for you. Automate means let it work without you. I still keep the last say on things I cannot undo, stories about people, and talks that need a human."
categories = ["Career", "AI"]
tags = ["AI agents", "governance", "TPM", "ethics", "leadership"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = 6
[cover]
image = "/images/posts/boundaries-irreversible-action-gate.jpg"
alt = "Hand on a red irreversible-action gate control, with force-push, prod-destroying ops, and legal/compliance locked out"
caption = "The system names the limits. A person still says yes or no."
+++

This is **part 6** of the [Agent production system](/posts/agent-production-system/) series. Previous: [Claim safety](/posts/claim-safety-evidence-before-metrics/). Later: [GitHub tokens](/posts/github-tokens-for-agent-fleets/) and [the last click](/posts/landing-floor-without-a-github-app/).

## Words I use below

**Agent.** A program that writes and lands code for you, in a chat session.

**Automate.** Let the agent do the step without you.

**Work path.** The steps from idea to shipped. I also call this the funnel. The middle is plans, code, and tests. The edges are the start and the finish — where someone can get hurt.

**Gate.** A stop the agent cannot skip. A check must pass, or a person must say yes.

**Irreversible.** An action you cannot fully undo. Shared history overwritten. Secret keys shown. Data gone. A public promise that a later undo cannot take back.

**Claim.** A public sentence about what you built, who did the work, or what the numbers are.

**Judgment.** A person deciding what is fair, true, or allowed when the rules do not pick for you.

**Stakeholder.** A person who owns the outcome and can say which path is right.

Those eight words are the whole toolkit. Now the point.

People mix two ideas. One is “the agent can do it.” The other is “the agent should do it.” They are not the same. I let the agent do the middle of the work path. I will not let it own a Thursday-night talk with a parent after a loss. The goal was never “automate everything.” The goal is a system that moves work fast **and** still has a place for a person to say no.

---

## The rule that doesn’t work

Every agent setup writes some version of:

> If an agent *can* do it, we should automate it.

That sentence is a wish. It is not a gate.

Better:

> For **this kind of action**, under **these checks**, may an agent go on without me — and if not, what does a person need in order to decide?

Most of the work path can still be fast: plans, code in a box, tests, cleanup, drafts that stay inside facts I can point to. Speed lives in the middle. The edges are where someone can get hurt, or you cannot undo it. That is the idea in [human approval](/posts/human-approval-merge-button/), used past the last click.

I used to do this job at Xbox. The title was TPM — keep a plan moving, and stop it when the risk is too high. Same craft as [Xbox work to agent fleets](/posts/xbox-slas-to-agent-fleets/): what must finish, what can break, and who decides. Models change. The need for a hard edge does not.

## Five things I will not automate

### 1. The last say on things you cannot undo

Overwrite shared history so the old versions are gone. Write secret keys into a file or a chat. Wipe the live system people actually use. Make a public legal promise.

These stay on a **human** gate. See [part 2](/posts/human-approval-merge-button/) and [About → Human approval](/about/?node=human).

“Irreversible” is not a vibe. It is a short list of action kinds where undo is expensive, incomplete, or impossible. Agents can prepare the change, name what could break, and wait. They do not get to decide that waiting is a bug.

### 2. Truth about people and work

Stories about how someone performed. Hiring. Public credit for other people’s work. Those are not “write me some content.” Agents can draft a list of what I did, or sum up a thread. People own the relationship and the fairness.

![Agent drafting an accomplishment list on one side; two people reviewing a final performance narrative behind a relationship-and-fairness gate on the other](/images/posts/boundaries-agent-leverage-human-judgment.jpg "Agents draft; humans own the relationship and the fairness")

This is the line that separates help from harm. A model that writes a confident story about someone else is not saving time. It is hiding a human decision inside smooth sentences. Same for credit on a public post or an internal note: if a person did the work, a person owns how that work is described when it matters.

### 3. Inventing who built the tools

I **extend and operate** multi-agent systems. I will not automate — or write by hand — a story that steals the original authors’ credit. Claim safety is a boundary, not a style guide ([part 5](/posts/claim-safety-evidence-before-metrics/)).

![Robot arm rewriting a README from “we built this” to “we extend and operate,” blocked by a claim-invention gate tied to verified figures](/images/posts/boundaries-claim-invention-gate.jpg "Upstream authors keep credit — operate and extend, don’t invent")

The failure feels good. You ran the stack hard, so the draft says “I built.” The honest sentence is usually longer and less shiny. Public pages, résumés, and the file that says what a project is all get the same gate — only numbers I can show, past tense where true, no pile of logos.

### 4. Coaching and the people who trust me

I am **head coach** at [Harriton High School lacrosse](https://harritonlacrosse.com/). Athlete trust, parent talks, and game-day calls are not a pile of tasks to run overnight. Sports tools ([Philly Lax](https://phillylaxstats.com/), [CFB playbooks](https://davevoyles.github.io/College-Football-26-Playbooks-site)) can help. They do not replace the coach.

Picture a Thursday night. Lineups. Playing time. A hard talk with a parent after a loss. No agent should own that path. Tools can chart stats and sort playbooks. The human still stands in the huddle.

![Night field after a game — two adult silhouettes at the edge of the lights. Tools do not own this conversation.](/images/posts/boundaries-thursday-night.jpg "I will not automate a Thursday-night conversation after a loss")

### 5. A fight only a person in the room can settle

When two stakeholders want different things, a model should not pick a winner in the dark. Asking a person is the feature.

Agents are good at a decision brief: options, risks, what each path costs, what evidence exists. They are bad as silent tie-breakers. The right answer is often about people, not code. A model cannot sit in that room. When it is not sure, stop and ask a person. Same idea as [eval gates](/posts/eval-gates-not-theater/) — automatic checks that can say no. “I don’t know” is not “round up to yes.”

![Two chairs across a closed folder; a third stool empty in the dark](/images/posts/boundaries-stakeholder-room.jpg "A model cannot sit in that room")

## What I *will* keep automating

Boundaries are clearer when you name the other side of the line:

| Automate hard | Keep human |
|---------------|------------|
| Repeat code inside a clear spec | Irreversible or hard-to-undo actions |
| Look-up and summary with sources | Performance, hiring, and public credit for people |
| Test / check / watch loops | Authorship and number claims without evidence |
| Routine cleanup under gates | Coaching, athlete trust, community duties |
| Drafting that stays inside facts I can show | Fights only a person can settle |

Speed belongs on the left. Dignity and accountability belong on the right. If a task sits in the middle, default to a gate — not to “the agent seemed sure.”

## How this shows up on About

If you only remember one walk through the picture on [About](/about/):

1. [Orchestrator](/about/?node=orchestrator) — holds the path
2. [Eval gates](/about/?node=eval) — automatic no
3. [Human approval](/about/?node=human) — human no
4. [Docker](/about/?node=docker) / [Azure](/about/?node=azure) — where it runs

The picture is the system. This post is the part the picture cannot do for you: agents move work; **gates and people** decide what never gets on the belt.

Later posts get concrete: how login works, and a lock that says no when a rule is broken. Short-lived keys. No paste-a-secret habit. The last click cannot approve itself. Boundaries are not only a talk about ethics. They are the details that keep agents from eating their own trust.

## What this is not

- Not a rant against tools — the middle of the work path is automated on purpose
- Not a claim that my home setup equals Xbox-scale traffic
- Not a promise that every agent action runs with no one watching
- Not permission to treat “wait for a person” as a bug to route around

A well-built agent stops, says why it stopped, and hands over a decision. A poorly built one talks to the gate until something looks green.

---

**Bottom line:** the goal was never “automate everything.” The goal is a production system — a setup that ships real work — with agents for speed, gates for truth, and humans for judgment. If that sounds like the old TPM job, good. It is.
