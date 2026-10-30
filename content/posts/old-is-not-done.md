+++
date = "2026-11-18T08:00:00-05:00"
draft = false
title = 'Old is not the same as done'
author = 'Dave Voyles'
description = 'My agent dashboard flagged two stale alarms and one idle pull request. The cleanup I added to quiet it also hid a live blocked pull request that still needed action. Age tells you when you last looked. It does not tell you whether the thing is finished.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'dashboards', 'alerts', 'ops', 'AI agents']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/old-is-not-done-cover.png'
alt = 'A to-do list where an old card has been muted to gray while a red flag on it is still raised.'
caption = 'Muted because it was old. Still needs action.'
+++

I have a small page that tells me what my coding agents need from me. It has one strip at the top, called Needs you, and the point of it is that I can glance at it over coffee and know whether I have work to do. One morning it told me I had three things waiting. As far as I could tell, I had zero. Two were alarms about nightly test runs that had gone red once and then passed every night since, and the third was a pull request that nobody had touched in days and that the page kept calling stuck. A strip that seems to cry wolf three times before breakfast is a strip you stop reading, which is worse than having no strip at all.

So my agents and I cleaned it up, and in the cleaning we hid a live blocked pull request that still needed action. My agents fixed it within a couple of hours, but the mistake is worth writing down, because I think it is one of the most common in any alert system: **age tells you when you last checked something, not whether it is done. Mute a row because you could not check it, never because it is old.**

![Two old rows enter a filter. Old and re-checked just now: still counts. Old and not re-checked: muted with a note to re-check before acting.](/images/posts/old-is-not-done-d1.gif)

*Where the fix ended up: old and verified still counts, old and unverified goes quiet with a note.*

## In brief

- My Needs you strip showed three items I took for noise: two stale test alarms and one long-idle pull request. The alarms were noise. The pull request, it turned out, really was stuck.
- The first fix closed alarms automatically once a later run of the same test passed, and muted any row older than 72 hours that had not been re-checked.
- That 72-hour rule also muted a live pull request my reviewer agent had blocked, because its last update was more than 72 hours old. It dropped out of the count, which is the one thing that strip exists to prevent.
- The follow-ups made live rows count no matter how old they are. Rows now mute only when the data behind them could not be refreshed.

## Words I use

- **Pull request** is a proposed change waiting to be reviewed and merged. My agents open them; a reviewer agent and sometimes I read them.
- **Nightly run** is the full test suite running on a schedule, once a day. **Red** means it failed; **green** means it passed.
- **Alarm** here means an issue that gets opened automatically when a nightly run goes red, so someone looks at it.
- **Stuck** is what the page calls a pull request that has sat in one stage longer than it should.
- **Cache** is the saved copy of all this that the page reads, so it does not ask GitHub on every refresh. Mine is rebuilt every minute.

## Two stale alarms and one stuck pull request

The two alarms had the same story. A nightly run failed, an alarm opened, and the next night the run passed. One of those projects had passed every night for more than a week. Nothing ever closed the alarm, because the system had a job that opened alarms when a run went red and no matching job that closed them when it went green. So the alarms sat there, technically true about one night a long time ago, and the strip counted them as today's problem.

The stuck pull request looked like a different flavor of the same thing. It had been untouched for days, and every minute the page looked at it, saw it was old, and called it stuck again. I read all three as facts about the past being shown as facts about now. For the two alarms, I was right.

The first fix had two parts, and both were reasonable. When a later scheduled run of the same test on the same branch passes, close the alarm and leave a comment linking the green run. And on the strip itself, mute any row older than 72 hours that has not been re-checked, sort it below the live rows, and stop counting it. That second rule came with a note in the change. More or less, it said a blocked pull request nobody has touched in 72 hours will also look stale, that this is intended, and to re-check before acting.

The bug was hiding in that note, written down as a feature.

## What the cleanup hid

My reviewer agent's review landed after the automation had already merged the change, and it found the hole. The strip rebuilds its list of open pull requests every minute, which means every open pull request has been re-checked within the last minute. But the stale rule looked at when the pull request was last *updated*, not when it was last *checked*. So a live pull request that the reviewer had blocked, and that still needed action, aged past 72 hours, went gray, and dropped out of the count.

The strip exists to say "this needs you," and a live blocked pull request that has sat for more than 72 hours is close to the best case for it. It needs action *because* it has sat so long, so the rule muted it for exactly the reason it mattered.

![Before: a blocked pull request last updated 80 hours ago goes gray and is not counted. After: the same row stays red and counts, because it was re-checked within the last minute.](/images/posts/old-is-not-done-d2.gif)

*Same row, same age. Whether it counts should depend only on whether the data is fresh.*

The follow-up was small. It marks rows for live pull requests as verified, because the cache just re-read them, and verified rows count no matter how old they are. The test that proves it uses the reviewer's own example: an open pull request blocked for review, last updated 80 hours ago, in a cache built just now. Before the change it came back muted with "older than 72h." After, it counts. The same test also checks that the row still mutes in the two cases where muting is honest: when the copy is a leftover from a refresh that failed, and when the whole cache has stopped updating.

## The stuck rule got the same fix

The first follow-up left one thing alone on purpose. Stuck rows older than 72 hours still muted, because that was the original complaint, the pull request that showed up as stuck on every refresh. A second follow-up landed a few minutes later and reversed that too. A live pull request that has sat past its stage limit stays on the strip however old it is. It mutes only when the data behind it could not be refreshed. It also replaced the test that had asserted the opposite, that an old stuck pull request should go quiet, with one that asserts it never mutes on age.

I find that part a little funny, in the way your own bugs get funny once they are fixed. The thing I complained about, a stuck pull request that kept showing up, was the strip working. The pull request *was* stuck. What I actually wanted was for it to stop being stuck, which is a job for me, not for a filter.

## The auto-close matched too loosely

The reviewer also caught something in the auto-close job. The first version closed every open alarm created before a green run. In the test cases, a green run from one workflow closed an alarm that belonged to a different one. The follow-up only closes an alarm when its red run names the same workflow and the same branch as the green one. If the alarm names no run, or the run can't be read, it stays open for the next check. If the green run itself can't be read, nothing closes. When in doubt, it stays loud.

## If you run a needs-attention list

Whether yours is an agent dashboard or an on-call page, here is the part of this I would steal:

- **Separate "how old is this thing" from "how old is my information about it."** The first is often the reason it matters. The second is the only good reason to doubt it.
- **Mute on unknown, never on age.** If you could not refresh the row, gray it out and say so ("re-check before acting"). If you did refresh it and it is still true, it counts.
- **Close alarms from evidence, and match the evidence.** A pass closes the failure it actually answers: same check, same branch, newer run. Anything you can't match stays open.
- **Read your own "this is intended" notes twice.** If the note describes the strip hiding the exact kind of item the strip is for, the note is the bug report.

## What the strip does now

The strip is quieter now, for the right reason. Old alarms close themselves when a later run proves them over. Live work stays on the list for as long as it is live, and the only things that go gray are things the page honestly could not check. I like a dashboard I can trust more than one that is tidy, and those turned out to be different requests. Old is not the same as done, and sometimes old is the whole point.
