+++
draft = true
title = 'My idle watcher exited clean and never saw me leave'
author = 'Dave Voyles'
description = "A small script that was supposed to hand my laptop to CI when I walked away failed three times in one afternoon under launchd. The third time it didn't crash at all. It just read zero, forever. Here's the check I run on every launchd job now."
categories = ['Programming', 'AI']
tags = ['automation', 'ops', 'macOS', 'How-to']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/the-watcher-that-read-zero-cover.png"
alt = "A laptop on a desk with an empty chair, and a small monitor beside it that reads idle: 0 seconds"
caption = "Nobody at the desk. The watcher said I had never left."
+++

Below is the two minute check that runs a launchd job the way launchd actually runs it. I wish I had run it before I spent a Monday afternoon watching the same small script fail three times.

The script is what I call the idle watcher. My agents share a handful of Macs for test runs and reviews, and I wanted the MacBook Pro, the laptop I actually work on, to pick up pull request test jobs only when I'm not using it. The rule is short. When the laptop has been on power and idle for ten minutes, its CI runners start. When I come back, unplug it, or close the lid, they stop once the current job finishes. A short Python script checks those things on a timer, and launchd, the built-in macOS service that starts background jobs and keeps them running, runs the script. You can think of it as cron that also babysits.

It worked fine in my terminal. Under launchd, it failed three different ways, and the third one was the one that worried me, because it didn't look like a failure at all.

A launchd job doesn't run in your shell. The environment launchd gives it is the test that counts. In the log, "I couldn't measure that" needs to look different from "I measured zero."

{{< motion-figure gif="/images/posts/the-watcher-that-read-zero-fig1.webp" still="/images/posts/the-watcher-that-read-zero-fig1-final.png" width="1440" height="700" alt="Three attempts on one timeline. Attempt 1 stops on a wrong Python, attempt 2 stops on a missing library, and attempt 3 finishes with a clean exit while its log reads idle_seconds=0.0 and a clock shows the real idle time passing 49 seconds." >}}

*The third attempt didn't crash. It logged zero while the laptop had really been idle for 49 seconds.*

## Three failures, one afternoon

The first install failed almost right away. The job's plist pointed at `/usr/bin/python3`. The plist is that small XML file which tells launchd what to run and how. On a Mac, that path is the Python that comes with Apple's Command Line Tools. On this laptop it was 3.9. The watcher shares code that needs 3.10 or newer, so it fell over on import. My terminal never hit this, because the `python3` on my PATH was a newer one.

The second failure was close behind. The script imports a pinned internal library, and it never told Python where that library lived, so launchd got `ModuleNotFoundError: config` instead of a running watcher. The fix for both was small. The plist now runs `/usr/bin/env python3`, its PATH already puts Homebrew first, and the script finds the pinned library on its own. Part of that same fix also made the watcher treat a missing system tool as "unknown" instead of crashing, which is a sensible thing for a watcher to do. Remember that one.

Then I installed it for real, and both watcher jobs ran under launchd and exited with code 0. That should have been the end of it. Here's what they logged:

```
idle_seconds=0.0
```

At that moment the laptop had actually been idle for 49 seconds. The watcher believed I had never taken my hands off the keyboard.

## Why the third one was quiet

launchd doesn't hand your job your shell's environment. It gives the job what the plist says and very little else. This plist set the PATH to `~/.local/bin:/opt/homebrew/bin:/usr/bin:/bin`. The watcher reads idle time with `ioreg`, and `ioreg` lives in `/usr/sbin`, which isn't on that list. In my terminal `/usr/sbin` is on the PATH, so the call worked every time I tried it by hand.

| | My terminal | Under launchd |
|---|---|---|
| `python3` | A newer one, 3.10+ | Command Line Tools 3.9, at first |
| PATH includes `/usr/sbin` | Yes | No |
| `ioreg` found | Yes | No |
| What the watcher logged | Real idle time | `idle_seconds=0.0`, every time |

So the `ioreg` call failed, the "treat it as unknown" code did its job, and the safe fallback filled in the blanks: idle time zero, lid open. With those numbers the watcher will never start a runner. That is the safe direction to fail in, since it means CI never grabs the laptop while I'm typing. It also means the watcher never did the one job it exists for, and nothing anywhere complained. The process exited clean and the log had a number in it. The number looked normal enough that I would have read right past it.

The crash in the first two attempts was annoying, but a crash is honest. The third attempt took a missing tool and turned it into a measurement.

## The check I run now

The third fix calls `pmset`, `ioreg` and `pgrep` by their full paths, the same way the rest of my dispatch code already did. It also added a test that checks every tool the watcher calls can be found using the plist's PATH alone. That test failed on the old code and passes now, which is what you want from a test written after a bug.

You can do the same thing for any launchd job in a couple of minutes. This is a simplified sketch, not my exact files, and the label and script in it are yours to replace. The `raw` option for `plutil` needs macOS 12 or newer. If your plist doesn't set a PATH at all, that first command fails, and that's fine: launchd then gives the job its default of `/usr/bin:/bin:/usr/sbin:/sbin`, so use that string instead.

```bash
# Pull the PATH the job will really get from its plist,
# then run the script with only that environment.
JOB_PATH=$(plutil -extract EnvironmentVariables.PATH raw \
  ~/Library/LaunchAgents/com.example.my-job.plist)

env -i HOME="$HOME" PATH="$JOB_PATH" /usr/bin/env python3 my-job.py
```

`env -i` starts the command with an empty environment, so nothing from your shell leaks in, and anything that only worked because of your dotfiles breaks right there in front of you instead of at 2 AM. When I ran the fixed watcher on the laptop with `env -i` and only the plist's PATH, it reported 91.1 seconds of idle instead of zero.

The tools need the same check, because a script can run fine and still call something it can't find:

```python
import shutil

# The PATH from your plist.
JOB_PATH = "/opt/homebrew/bin:/usr/bin:/bin"

for tool in ("pmset", "ioreg", "pgrep"):
    if shutil.which(tool, path=JOB_PATH) is None:
        raise SystemExit(f"{tool} is not on the job's PATH")
```

The better version uses full paths for system tools and keeps the check anyway, since the next person to touch the script (very possibly an agent, in my house) won't know why the full paths are there.

![A four step checklist in order: read the plist PATH, run the script with env -i, resolve each tool on that PATH, and see a real reading instead of a zero.](/images/posts/the-watcher-that-read-zero-fig3.png)

*Four checks in order, and the last one is a real reading: 91.1 seconds of idle instead of zero.*

## Make "unknown" loud

The PATH was the bug, but the fallback is what hid it. Treating a missing reading as "assume the safe values" kept the laptop safe, and it also turned a broken watcher into one that looked healthy. If I were writing it fresh, a reading the watcher couldn't take would show up in the log as its own thing, with the tool's name, and a run where every reading came back unknown would count as a failure, not a quiet zero.

Your launchd job runs on a stranger's Mac that happens to share your disk, with its own Python and its own PATH. The job gets tested there before you trust it, and a watcher that can't see something reports it instead of guessing.
