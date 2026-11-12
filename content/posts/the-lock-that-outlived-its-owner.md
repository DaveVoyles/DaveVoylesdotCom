+++
draft = true
title = 'My merge lock outlived the process that took it'
author = 'Dave Voyles'
description = "A background merge took a plain directory lock, and a reboot at the wrong moment would have left that lock behind forever. Here's how to write a lock that remembers who's holding it, so it can clean up after a crash."
categories = ['Programming', 'AI']
tags = ['AI agents', 'automation', 'agent tooling', 'ops', 'Pattern']
topics = ['Tech', 'AI and Agents']
[cover]
image = "/images/posts/the-lock-that-outlived-its-owner-cover.png"
social = "/images/posts/the-lock-that-outlived-its-owner-cover-social.png"
alt = "A closed lock with a small blank name tag hanging from its shackle, standing in for a lock that records who holds it."
caption = "A lock that only says \"busy\" can't tell you whether anyone is still busy."
+++

By the end of this post you'll have a lock for a shell script that cleans up after itself when the process holding it dies. That sounds like a small thing until a reboot leaves one behind and every run after it politely refuses to start.

Here's how I got there. I have a small script my coding agents use to land a pull request, meaning it checks it, merges it, then tidies the branch afterwards. Agents run their shell commands under a time limit of about two minutes. A careful merge can take longer than that, so the script grew a background mode. You start it and it detaches. Later, the agent checks back with a poll command that answers landed, still pending, or failed.

A background job needs a lock, because you don't want two of them merging the same pull request at once. The first version used the oldest trick in the shell book, which is to make a directory and treat "the directory exists" as "someone is busy." It worked fine right up until you asked what happens if the process dies without cleaning up.

**A lock should record who holds it, so the next caller can check whether that holder is still alive.**

> In short: a plain directory lock can't tell a busy holder from a dead one. Put the holder's pid inside it, check that pid with `kill -0`, and clear the lock when nobody answers. One narrow race is still open, and I'll show you where.

![After the holder dies, a plain directory lock stays in place and every later run is refused. A lock with a name tag lets the next run read the pid, find nobody home, clear the lock, and carry on.](/images/posts/the-lock-that-outlived-its-owner-fig1-plain-vs-named.png)

*A lock that only says busy can't tell a live holder from a dead one. Put the holder's pid inside it, and the next run can check.*

## Why a directory makes a decent lock

Making a directory is a nice lock primitive because the operating system does the hard part for you. The POSIX spec for `mkdir` says it fails with `EEXIST` when the name already exists, so if two processes race to create the same directory, one gets it and the other gets an error. You don't need a lock server, a database row or a library, just a path both sides agree on.

The weakness is that the directory doesn't know anything about who made it. It says "busy" and nothing else. If the script exits normally, a cleanup trap removes the directory and everyone is happy. If the script gets a `SIGKILL`, or the machine reboots partway through a merge, no trap runs, and the directory sits there with nobody behind it.

From the outside a held lock and an abandoned one look exactly the same. So every later attempt to land that pull request in the background would be refused, forever, by a lock whose owner was long gone. The reviewer on the first version flagged this as an open gap, and it got its own follow-up change.

## Give the lock a name tag

The fix is to put one small file inside the lock directory: the process ID of whoever holds it. A process ID, or pid, is the number the operating system gives every running program. When a new run finds the lock already taken, it reads that number and asks the system whether a process with that pid still exists.

The shell way to ask is `kill -0`. It sounds alarming, but signal 0 doesn't send anything. The POSIX spec describes it as "error checking is performed but no signal is actually sent," which makes it a cheap "are you there?" Here's the shape of the check, trimmed from the real script:

```bash
take_lock() { mkdir "$lock" 2>/dev/null && echo $$ > "$lock/pid"; }

if ! take_lock; then
  held=$(cat "$lock/pid" 2>/dev/null)
  case "$held" in ''|*[!0-9]*) held='';; esac      # not a number? treat as unknown
  if [ -n "$held" ] && kill -0 "$held" 2>/dev/null; then
    echo "already running (pid $held)" >&2; exit 5
  fi
  echo "clearing a stale lock (pid ${held:-unknown} is gone)" >&2
  rm -f "$lock/pid"; rmdir "$lock" 2>/dev/null
  take_lock || { echo "already running" >&2; exit 5; }
fi
```

If the holder is alive, you back off exactly like before. If the check fails, you treat the holder as gone, say so in the log, clear the lock and take it yourself. That log line earns its keep later, because when something odd happens you can see that a lock was cleared and whose it was, instead of guessing.

| Lock state | What the old lock did | What the name-tagged lock does |
| :--- | :--- | :--- |
| Holder alive | Refuse | Refuse, and name the pid |
| Holder killed or rebooted away | Refuse, forever | Clear it, log why, take it |
| Directory exists, no pid file yet | Refuse, forever | Treat as stale, clear it, take it |

## Two details that are easy to miss

The empty lock is the first one, the bottom row of that table. There's a tiny window between creating the directory and writing the pid file. If the process dies in exactly that window, you get a lock with no name tag at all. The follow-up treats a lock with no readable pid as stale, which is the right call, because a lock with no owner is a lock nobody can ever release.

The second one is sneakier, and it's my favorite detail in the change. In background mode, the shell that takes the lock doesn't do the work. It launches a detached worker and exits straight away, because detaching is the whole point. If the lock kept the launching shell's pid, the very next check would find that pid gone and decide the lock was stale while the real worker was still busy merging. So right after launch, the script rewrites the pid file with the detached worker's pid, the one that's actually holding the lock.

{{< motion-figure gif="/images/posts/the-lock-that-outlived-its-owner-fig2-pid-handoff.webp" still="/images/posts/the-lock-that-outlived-its-owner-fig2-pid-handoff-final.png" width="1600" height="1410" alt="The launcher takes the lock, spawns a worker, and exits. Without a hand-off, a second run sees the launcher's dead pid and barges in while the worker is still busy. With a hand-off, the pid file points at the worker and the second run backs off." >}}

*If the lock still holds the launcher's pid after that shell exits, the next check will think the lock is stale while the worker is still merging. Hand the lock to the worker.*

## The part that isn't fixed

I'd rather tell you this than have you find it. During review, a reviewer found a narrow race: two landers can both look at the same stale lock and both decide it's theirs to clear. It's logged as a follow-up and wasn't fixed in this change. The window is narrow, but if you have lots of callers going after the same lock, this pattern alone isn't enough, and you'd want a real locking tool such as `flock` instead.

There's a second gap in that same check. `kill -0` also fails when the holder is alive but belongs to a different user, because you aren't allowed to signal it, and the snippet above reads that failure as "gone" and takes the lock. The pattern assumes every caller runs as the same user, which is how my script is meant to run. If yours doesn't, a careful version treats that permission error as "still held" and waits.

The other honest caveat is general rather than mine. A pid is only a number, and Linux hands them out up to a ceiling and then wraps around, so on a busy machine a dead holder's pid could in principle belong to some unrelated process by the time you check. That fails safe, because the lock looks held and you wait, but it's worth knowing before you trust a pid for anything more serious than "should I wait?"

## Test the ugly cases on purpose

The follow-up came with tests for the cases that matter: a live holder, a dead pid, an empty lock, and the cleanup afterwards. Notice that only one of the four is the normal busy case. The other three are about a holder that left a mess behind. The happy path, where the script takes the lock and gives it back, was never the problem. One thing I noted at the time was that the lock tests weren't wired into CI yet, so they only ran when someone ran them by hand, which is its own small lesson about tests you have to remember to run.

## Do this tonight

1. Find every lock in your scripts that's just "a file or directory exists."
2. Put the holder's pid inside it when you take it.
3. When the lock is taken, check the holder with `kill -0` before refusing.
4. Treat a lock with no readable pid as stale.
5. If your script detaches, hand the lock to the worker's pid, not the launcher's.
6. Log every time you clear a stale lock, with the pid you found.
7. Write tests for the dead holder and the empty lock, then make sure CI actually runs them.

A lock that only says "busy" will eventually be lying to you, and the fix costs one small file. Write down who's holding it, and the next run can tell the difference between someone working and someone who left the light on.
