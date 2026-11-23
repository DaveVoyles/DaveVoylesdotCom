+++
date = '2026-11-22T12:00:00-05:00'
draft = true
title = "If I can't watch it, it didn't run"
author = 'Dave Voyles'
description = "My agent wrote down that I watched a session I never saw. Now every run in my agent chain needs a window I can open or proof it left behind, and a run with neither counts as not run."
categories = ['Programming', 'AI']
tags = ['Build-log', 'AI agents', 'agent tooling', 'Hermes', 'automation']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/if-i-cant-watch-it-it-didnt-run-cover.png'
alt = 'Two identical monitors side by side, one lit with activity and one dark, standing for a run I can watch next to one I cannot'
caption = 'Two windows into the same basement. Only one of them was on.'
+++

The note said I watched it. I didn't.

On Sunday morning I asked Rex, my assistant on Muse, to take the notes from our voice session and file them into my vault. Rex handed the job to a Claude Code session on the Pro, the always-on Mac in my basement, and its brief said the session doubled as a test: I'd be watching it live from the Claude Remote app. The session did the work, wrote the note and pushed it to main. Then, in the table of things it had checked that morning, it wrote the line at the top of this diff:

```diff
- | Claude Remote app | The session that filed this note was itself the remote-control test; Dave watched it in the Claude Remote app. |
+ | Claude Remote app | Remote control failed at launch for this session (Claude.ai login rejected), so it was not visible in the app. The login was fixed later that morning; separate named test sessions then connected. |
```

The bottom line is the correction, which went in afterward. Remote control had failed at launch because the login was rejected, so there was nothing on my phone to watch. The agent wasn't lying: the brief said I was watching, and it copied the brief into its findings as if it had seen it happen.

I'm handing more of my coding work down a chain of agents, and the trust in that chain rests on a rule: every run either has a window I can open or leaves proof behind, and a run with neither counts as not run.

![The chain from Dave to Rex to an orchestrator to sub-agents, with three windows underneath: Hermex verified, the Claude Remote app blocked, and asking Rex](/images/posts/if-i-cant-watch-it-it-didnt-run-fig1-chain.png)

*Four hops between me and the code, and three ways to watch them. On Sunday, the middle window never opened.*

## Four hops between me and the code

The chain runs like this now. I give Rex a task, by voice or by text, and Rex stands in for me and briefs an orchestrator session on the Pro. That orchestrator splits the work across sub-agents, each with a written role: one implements, one reviews, a critic pokes holes before anything merges, and a tester proves the result. The role is a short contract file: what the agent does, what it must not do, and what its report looks like, so nobody has to guess what "done" means.

Every hop is a place where a claim can pass along without anyone checking it. Rex said I'd be watching, the brief said I'd be watching, and the session wrote down that I watched.

So I rank the ways a coding task can run. The order comes from whether I can see the work and what it costs.

| Rank | Route | Where it runs | How I watch it |
|---|---|---|---|
| 1, the default | Bender, my engineering agent (Hermes, which I extend and operate) | The Pro | Hermex, the app that lists Hermes sessions |
| 2 | Claude Code, briefed by Rex | The Pro | The Claude Remote app, through remote control |
| 3, avoid for now | Cloud agents through Rex's own tooling | Someone else's computer | Ask Rex |

Cloud sits last because it uses up plan usage. I keep it for the days when a lot of jobs are running and I don't want to bury the machines at home, which isn't most days.

## One flag pair decides whether a run exists to me

Hermes taught me this part before Claude did. Bender launches every job like this:

```sh
hermes chat --source cli -c "Bender: <repo>#<issue>" --create-if-missing -q "<brief>"
```

The `--source cli` flag and the `-c` title are what put the session in Hermex. Without them, Hermes tags a plain `hermes chat -q` as `oneshot`, and Hermex hides it. The machine, the work and the pull request at the end are the same, and I can't see any of it while it happens. We checked this on November 12 with a session named "Bender: Hermex visibility test", and the Bender wrapper now passes both flags every time so nobody has to remember them.

![A plain run tagged oneshot and hidden next to a flagged run that shows up in Hermex, both ending at the same pull request](/images/posts/if-i-cant-watch-it-it-didnt-run-fig2-hidden-vs-named.png)

*Same job, same pull request. The flags only decide whether I get to watch.*

Claude Code has its own version of the same switch. On the Pro, `claude --help` lists it:

```text
--remote-control [name]   Start an interactive session with Remote Control enabled (optionally named)
```

On Sunday both windows got tested. Rex created a named Hermes session, "Rex Hermex visibility test", and I saw it in Hermex. The Claude session that filed my note never showed up, because the login behind remote control was rejected at launch. Once that was fixed later in the morning, separate named test sessions connected fine. The window that didn't work was the one the agent said was live.

## Proof for when the window is closed

A window only helps while I'm looking, and most of the time I'm not, which is the whole reason to have agents. So the tester's job is to prove the work with artifacts: for anything on screen that means screenshots at 390 pixels wide, about a phone, and at 1440, about a laptop, embedded in the pull request under a `## Proof` heading. If the screenshots can't be made, a note saying what was tried and why is enough. A missing screenshot never blocks the work. A claim with no artifact and no note gets marked NOT RUN.

| What the tester hands back | What I count it as |
|---|---|
| Screenshots at both widths under `## Proof` | Proven |
| No screenshots, plus a note on what was tried and why | An honest gap; the work keeps moving |
| "Done," with nothing attached | NOT RUN |

A note costs nothing and tells me where to look. If a missing screenshot blocked the merge, agents would learn to skip the attempt or to fake the picture.

I won't take a confident sentence with nothing behind it. Under the rule, the session should have written "not checked" in that cell. Its other work held up, since the note was sitting on main with a commit I could read. The window failed and the proof covered for it. The one sentence that claimed a window had nothing behind it.

![A pull request's Proof section three ways: screenshots at both widths, a note on what was tried, or missing entirely](/images/posts/if-i-cant-watch-it-it-didnt-run-fig3-proof-outcomes.png)

*A note keeps the work moving. A missing Proof section means it didn't run.*

## Where this loop goes next

This post started as that note, and it brings back a loop I ran a while ago in a Grok Bot room for this blog. One agent recapped the week's engineering work from the logs, which meant GitHub then and means Markdown in my vault now, and pitched post ideas. A critic agent tore the ideas apart and another agent made the images. Rex filed the notes, an agent pulled an idea out of them, and here we are.

The same rule carries over to the loop. If I can't watch an agent work, I want to see what it left behind, and if it left nothing, I treat the run as one that never happened. It applies to an agent that tells me otherwise, including the one that says I was watching.
