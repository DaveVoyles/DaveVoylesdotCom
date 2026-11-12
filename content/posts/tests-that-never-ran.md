+++
date = "2026-10-19T10:00:00-04:00"
draft = false
title = 'Tests that never ran now run'
author = 'Dave Voyles'
description = 'CI stayed green while a film render test failed on the default branch for about six hours — because the mixed browser-and-unit file that held it had sat off the schedule for a long time.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'CI', 'testing', 'film', 'ops', 'AI agents']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/tests-that-never-ran-cover.png'
alt = 'A tray of four round lamps: three lit green with check marks, and one dark with a dashed outline. It stands for green checks that say nothing about the test nobody scheduled.'
caption = 'Green means the checks you scheduled passed. It does not mean every test you wrote ran.'
+++

A case that checks how a scene render names its output broke on the default branch and stayed broken for about six hours, until someone ran it by hand. CI never flagged it, because the file that held that case had sat off the continuous-integration checks for a long time. The dashboard had not been asked to run that file.

The rule I took from it is that **green only proves the checks you scheduled.** That case never ran in CI, and the failure never showed up.

<!-- figure: primary (D1), scheduled green path vs unscheduled failing case trapped off the board; comparison fork; Field Notes lane -->

![A green CI board labeled All green beside a sealed Unscheduled folder with a failing, unseen test ticket inside, marked Not on the list](/images/posts/tests-that-never-ran-scheduled-vs-not.png "The board showed every scheduled check passing. The failing case sat in a file that was not on the list.")

## The file that sat off the board

**CI** (continuous integration) is the automatic check run that starts when you propose a change. Green means those checks passed. The CI schedule is the list of checks your workflow actually starts, and if a test is not on that list, green does not cover it. I already write about eval gates on this site: checks that are supposed to be real, not ones that cannot fail. **Schedule omission** is when the gate is honest about what it ran, and you never put the failing file on the stage.

In a film and design toolchain I use for short product films and page kits, several test suites for film and design and related kits had never been wired into the checks workflow. One render test file mixed heavy browser-and-ffmpeg cases with a few pure argument-parsing cases. A browser case drives a real browser, often through Playwright, and sometimes shells out to ffmpeg for video or audio. A pure unit case needs only the language runtime: parse these flags, expect this name. No browser, no video encoder. Because the file as a whole needed Playwright and ffmpeg, it was left out of CI whole, so even the cheap cases never ran.

That is a reasonable engineering compromise until the day a pure case starts failing on main and CI has no opinion about it.

## What the render case expected

The case that hurt was a render `--scene` check. After a change in how renders name their output files, names follow the shape the film config picks, and the demo fixture produced a portrait frame. Aspect is the frame shape, and output filenames follow the shape the config picks. The test still hard-coded the older landscape expectation. The fixture itself had not changed in a long time. The test is what went stale.

A fixture is a small canned project the tests use as a stand-in for a real film or page. Its aspect changed how the output is named, and the test still expected the old shape. It failed unseen on main while CI stayed green. Run locally with a name filter, it failed for a boring, honest reason: expected one aspect in the output name, got the other. On the default branch, CI never started that file, so the branch stayed green. That same afternoon, the suites that had never been on the board were wired into CI. The mixed file was still left off, and a change a few hours later broke a case inside it while CI stayed green.

| Piece | What we thought | What was true |
|---|---|---|
| CI green | The important tests passed | The important *scheduled* tests passed |
| Mixed test file | Too heavy for CI, so skip the file | The pure cases inside it were skipped too |
| Render `--scene` case | Quiet / fine | Failing on main against the fixture’s aspect |
| Unwired suites | “We will add them later” | Later arrived that afternoon, and the mixed file was still left off the board |

<!-- figure: cadence (D2), break shape: mixed file → whole file omitted → stale aspect red unseen; fix spine: pure case alone on schedule → expectation reads fixture → CI sees red then green; Field Notes lane -->

![Broken path: Mixed file, Omit whole, Stale aspect. Fix path: Pure alone, Read fixture, CI sees it](/images/posts/tests-that-never-ran-fix-spine.png "The fix pulled the pure case out of the mixed file, pointed it at the real fixture, and put it on the schedule where CI can see it.")

## Scheduled alone, not as a blob

The file was not all-or-nothing. The pure case went on the schedule alone, and the heavy file stayed out as a whole until it has a real browser job, which was not "run everything."

The pure `--scene` argv case does not need a browser. It needs the test runner and a name pattern. So the film logic-only CI step now runs that case alone. The rest of the file, the part that truly needs Playwright and ffmpeg, stays out of that cheap step until there is a CI job that can host it. No expectation was loosened: the case now asks the fixture for the aspect it should expect, and a second assert covers an explicit landscape override.

A few hours before the case broke, the suites that had never run at all had been wired into the checks workflow with path filters, so only the touched area pays for its tests. A **path filter** is a rule that runs a CI step only when files under a certain folder changed, so untouched areas do not pay for that step. Scaffold smoke checks cover a handful of "make a new starter" paths. A starter is a ready-made project template someone can copy. If its tests never run, a broken starter can ship looking fine. Renders stopped depending on a personal checkout on one machine, and a couple of voice-path guard tests joined CI the same way, path-filtered, honest about what they need on the runner (including ffmpeg on the path for the film voice step). All of that landed first. The mixed file was still off the board, and that is exactly where the next break hid.

None of that wiring covered this file. The board said "we meant to look someday" until the case was on the schedule, and then it said "we looked".

| Failure mode | What it feels like | What to do |
|---|---|---|
| Theater gate | Checks that cannot really fail | Make failure possible and loud (different post) |
| **Never scheduled** | Green while a known case is red on main | Inventory files not named in the workflow |
| Mixed file left out whole | Browser cost teams out cheap cases | Split: schedule pure cases alone |
| Stale fixture expectation | Test hard-codes a shape the fixture no longer implies | Assert against the fixture (or an explicit flag), not folklore |
| Path filter that never matches | Step exists but never runs for real changes | Prove the filter with a deliberate touch |

## When the next file is missing

The pass is the same in any repo that trusts "CI is green": list the test files, diff that list against every job and step in the workflow. Anything missing is not covered by green. You flag mixed files in that pass. If one file needs a browser and also holds pure cases, the pure cases are one name-pattern away from CI, and you do not wait for a perfect browser job. When you mark a skip as "skip for now," you write down what you skipped. A comment in the workflow keeps the skip after the memory of it expires in a week. We ran the newly scheduled case first and watched it fail for the reason we expected, and only then did the expectation fix land. Orphan suites should run when their folder changes, not on every push, and not never.

## What green is willing to miss

Not every Playwright file belongs on the cheapest CI runner. Omission is a decision, and for a long time our decision was "leave the mixed file off the board," which quietly included a pure case that nobody was watching when it broke.

Green on that branch reported the cases on the schedule. If that is to mean "this branch is safe to ship," the schedule has to include the cases that would have stopped you. A case left off the schedule is a case nobody will see fail.
