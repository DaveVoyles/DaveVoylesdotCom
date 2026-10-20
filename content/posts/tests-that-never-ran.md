+++
date = "2026-10-19T10:00:00-04:00"
draft = true
title = 'Tests that never ran now run'
author = 'Dave Voyles'
description = 'CI stayed green while a film render test failed on the default branch for about six hours — because the mixed browser-and-unit file that held it had sat off the schedule for a long time.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'CI', 'testing', 'film', 'ops', 'AI agents']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/tests-that-never-ran-cover.png'
alt = 'A three-step green path labeled Write test, Schedule it, and CI can fail. A dashed branch drops off after step one into a circle marked Never scheduled, which leads to a faint circle marked Invisible red.'
caption = 'Green means the checks you scheduled passed. It does not mean every test you wrote ran.'
+++

The build was green. That was the annoying part.

Somewhere under a film render pipeline I care about, a case that checks how a scene render names its output broke on the default branch and stayed broken for about six hours, until someone ran it by hand. CI never flagged it, because the file that held that case had sat off the continuous-integration checks for a long time. The dashboard was not lying about the jobs it ran. It was silent about the jobs nobody had asked it to run.

So here is the rule I took away: **green only proves the checks you scheduled.** A failing test that never runs is invisible success — the same comfort as a locked door you never try.

<!-- figure: primary (D1) — scheduled green path vs unscheduled failing case trapped off the board; comparison fork; Field Notes lane -->

![A green CI board labeled All green beside a sealed Unscheduled folder with a failing, unseen test ticket inside, marked Not on the list](/images/posts/tests-that-never-ran-scheduled-vs-not.png "The board showed every scheduled check passing. The failing case sat in a file that was not on the list.")

## In brief

- **CI** (continuous integration) is the automatic check run that starts when you propose a change. Green means those checks passed.
- A test file that mixed **browser** cases (needs a real browser and often ffmpeg) with **pure** logic cases was left out of CI whole, so even the cheap cases never ran.
- A film render case went **stale** against its demo fixture: the fixture’s aspect changed how the output is named, and the test still expected the old shape. It failed unseen on main for about six hours while CI stayed green.
- The order matters. That same afternoon, the suites that had never been on the board were wired into CI. The mixed file was still left off, and a change a few hours later broke a case inside it while CI stayed green.
- The fix was not “run everything.” It was **schedule the pure case alone**, and leave the heavy file out as a whole until it has a real browser job.

## Words I use

- **CI / schedule** — the list of checks your workflow actually starts. If a test is not on that list, green does not cover it.
- **Pure (unit) case** — a check that needs only the language runtime: parse these flags, expect this name. No browser, no video encoder.
- **Browser case** — a check that drives a real browser (often via Playwright) and sometimes shells out to **ffmpeg** to touch video or audio.
- **Path filter** — a rule that runs a CI step only when files under a certain folder changed, so untouched areas do not pay for that step.
- **Fixture** — a small canned project the tests use as a stand-in for a real film or page.
- **Aspect** — the frame shape, portrait or landscape. Output filenames can follow the shape the config picks.
- **Starter** — a ready-made project template someone can copy. If its tests never run, a broken starter can ship looking fine.

## The quiet kind of green

I already write about eval gates on this site: checks that are supposed to be real, not theater. This is a sibling failure with a different shape. Theater is when the gate looks serious but cannot fail. **Schedule omission** is when the gate is honest about what it ran, and you simply never put the failing file on the stage.

In a film and design toolchain I use for short product films and page kits, several test suites for film, design, and related kits had never been wired into the checks workflow. Separately, one render test file mixed heavy browser-and-ffmpeg cases with a few pure argument-parsing cases. Because the file as a whole needed Playwright and ffmpeg, it stayed out of CI. The pure cases rode along in exile.

That is a reasonable engineering compromise until the day a pure case starts failing on main and CI has no opinion about it.

## What was failing, and why CI never saw it

The case that hurt was a render `--scene` check. After a change in how renders name their output files — names follow the shape the film config picks — the demo fixture produced a portrait frame. The test still hard-coded the older landscape expectation. The fixture itself had not changed in a long time. The test is what went stale.

Run locally with a name filter, it failed for a boring, honest reason: expected one aspect in the output name, got the other. On the default branch, CI never started that file, so the branch stayed green.

| Piece | What we thought | What was true |
|---|---|---|
| CI green | The important tests passed | The important *scheduled* tests passed |
| Mixed test file | Too heavy for CI, so skip the file | The pure cases inside it were skipped too |
| Render `--scene` case | Quiet / fine | Failing on main against the fixture’s aspect |
| Unwired suites | “We will add them later” | Later arrived that afternoon, and the mixed file was still left off the board |

<!-- figure: cadence (D2) — break shape: mixed file → whole file omitted → stale aspect red unseen; fix spine: pure case alone on schedule → expectation reads fixture → CI sees red then green; Field Notes lane -->

![Broken path: Mixed file, Omit whole, Stale aspect. Fix path: Pure alone, Read fixture, CI sees it](/images/posts/tests-that-never-ran-fix-spine.png "The fix pulled the pure case out of the mixed file, pointed it at the real fixture, and put it on the schedule where CI can see it.")

## The fix was smaller than “run the whole file”

The useful move was to stop treating the file as one all-or-nothing blob.

The pure `--scene` argv case does not need a browser. It needs the test runner and a name pattern. So the film logic-only CI step now runs that case alone. The rest of the file, the part that truly needs Playwright and ffmpeg, stays out of that cheap step until there is a job that can host it. No expectation was loosened: the case now asks the fixture for the aspect it should expect, and a second assert covers an explicit landscape override.

Earlier that same afternoon, a few hours before the case broke, the suites that had never run at all had been wired into the checks workflow with **path filters**, so only the touched area pays for its tests. Scaffold smoke checks cover a handful of “make a new starter” paths. Renders stopped depending on a personal checkout on one machine, and a couple of voice-path guard tests joined CI the same way — path-filtered, honest about what they need on the runner (including ffmpeg on the path for the film voice step). All of that landed first. The mixed file was still off the board, and that is exactly where the next break hid.

None of that is glamorous. It is the difference between a dashboard that means “we looked” and a dashboard that means “we meant to look someday.”

## Painted green vs never scheduled

| Failure mode | What it feels like | What to do |
|---|---|---|
| Theater gate | Checks that cannot really fail | Make failure possible and loud (different post) |
| **Never scheduled** | Green while a known case is red on main | Inventory files not named in the workflow |
| Mixed file left out whole | Browser cost teams out cheap cases | Split: schedule pure cases alone |
| Stale fixture expectation | Test hard-codes a shape the fixture no longer implies | Assert against the fixture (or an explicit flag), not folklore |
| Path filter that never matches | Step exists but never runs for real changes | Prove the filter with a deliberate touch |

## Put it into practice

If you own a repo where “CI is green” is part of how you sleep:

1. **List the test files.** Diff that list against every job and step in the workflow. Anything missing is not covered by green.
2. **Flag mixed files.** If one file needs a browser and also holds pure cases, the pure cases are one name-pattern away from CI. Do not wait for a perfect browser job.
3. **When you “skip for now,” write down what you skipped.** A comment in the workflow beats a tribal memory that expires in a week.
4. **Prove the red before you celebrate the fix.** Run the newly scheduled case and confirm it fails for the reason you think, then land the expectation fix. Otherwise you have only scheduled a green that still means nothing.
5. **Path-filter with intent.** Orphan suites should run when their folder changes — not on every push, and not never.

## Bottom line

I am not arguing that every Playwright file belongs on the cheapest CI runner. I am arguing that **omission is a decision**, and for a long time our decision was “leave the mixed file off the board,” which quietly included a pure case that nobody was watching when it broke.

Green is a claim about the schedule. If you want that claim to mean “this branch is safe to ship,” the schedule has to include the cases that would have stopped you — or you have to admit, out loud, which failures you are willing not to see.
