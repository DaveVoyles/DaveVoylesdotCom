+++
date = "2026-11-13T08:00:00-05:00"
draft = false
title = 'One render in 25 just stopped talking'
author = 'Dave Voyles'
description = 'About one render in 25 just stopped talking: no error, no finish. Bounding one audio filter made the stalls stop. I still cannot tell you why. The real fix was giving every outside tool a finish line.'
categories = ['Programming', 'AI']
tags = ['Build-log', 'ffmpeg', 'timeouts', 'ops', 'AI agents']
topics = ['Tech', 'AI and Agents']
[cover]
image = '/images/posts/the-silence-that-never-ended-cover.png'
alt = 'A render progress bar stops partway while a flat line labeled silence runs on off the edge, with a small tag reading no error, no finish.'
caption = 'No error and no finish. The render just stopped.'
+++

The render did not fail. That would have been polite. It just sat there, forever, with nothing on the screen and nothing in the log, like a guest who has finished dinner and decided not to leave.

I use a small film and design toolchain to make short product videos, and my coding agents do most of the work on it. Under a loop test, about one render in 25 hung like that. It gave no error and no message, and from the outside I couldn't tell whether it was thinking hard or had quietly died in its chair. The trigger turned out to be an audio filter left without a length, which its manual says will pad silence indefinitely. Give it a length and the stalls stopped. I still don't know why the unbounded version stalled only some of the time. That is the most annoying kind of bug there is. So here is the rule I took away: **every call to an outside tool needs a finish line, and when it crosses that line, it should say why.**

![A render starts and branches three ways: finished; stopped at a deadline with the tool and wait time named; and the old way, marked with an X, hanging forever with no message.](/images/posts/the-silence-that-never-ended-d1.png)

*A render should end one of two ways: it finishes, or it stops and says why. The old third way was hanging forever with nothing said.*

## In brief

- A **render** that hung forever was not slow. It was stuck in the audio mixer, where a filter padded each track with no length set. I don't know why that stalled only some of the time.
- The audio step used a filter that adds silence to the end of a track. Left without a length, it adds silence indefinitely, and the manual says so in plain words.
- A second, quieter trap: the tool can sit waiting for keyboard input that never comes.
- The fix was boring on purpose. Give the silence a length, close the input, and put a time limit with a clear error on every ffmpeg call in the render scripts. After that, loop runs came back with zero stalls and the same audio.

## Words I use

- **ffmpeg** is the command-line tool that does almost everything with audio and video: cutting, mixing, gluing, converting. Most video software you have touched leans on it somewhere.
- **Render** means building the finished video file from its parts: pictures, narration, music.
- **Filter** is one step inside ffmpeg that changes the sound or picture on its way through.
- **Graph** (filter graph) is the chain of filters wired together for one job, here: pad, trim, duck the music under the voice, mix.
- **`apad`** is the filter that pads the end of an audio track with silence, so a short narration lines up with a longer video.
- **stdin** (standard input) is the program's ear. By default, many command-line tools listen there for typed commands.
- **Timeout** is a deadline a program gets. Miss it and it is stopped.
- **Hang** means the program is still running but will never finish on its own.

## How a reasonable filter stalled the mixer

Picture the job. The video is five seconds long. The narration is three seconds. You want the two to end together, so you ask ffmpeg to pad the narration with two seconds of quiet. The filter for that is `apad`, and it is the right tool.

The [ffmpeg filter documentation](https://ffmpeg.org/ffmpeg-filters.html#apad) spells out the catch: if you do not tell `apad` how long to make the track, "the filter will add silence to the end of the input stream indefinitely." Our mixer did exactly that. It padded the narration, music and sound-effect tracks with no length set, then trimmed each one back to the video's length a step later, in the same graph. After that, the graph turned the music down under the voice and mixed everything together. On paper the trim is the finish line. (The manual's own example pairs `apad` with a different finish line, an option that stops at the shortest stream. Our mixer didn't use it.)

That combination, pad without limit and trim later, worked almost every time. Under a loop test it stalled about 3 or 4 times in 100. Swapping in a pad with a set total length, equal to the video's, gave the same audio and 0 stalls in 150 runs. That is what I know: the trigger and the fix. What I can't tell you is the inner cause, what ffmpeg was actually doing inside that graph when it stalled. Nobody traced it, so I'm not going to invent a story for it. I don't know.

![Before: pad with no length, trim later, then mix stalled about 3 to 4 times in 100, cause unknown. After: pad to the video length, then mix gave 0 stalls in 150 with the same audio.](/images/posts/the-silence-that-never-ended-d2.png)

*One change to the audio step. Padding with no length stalled about 3 or 4 times in 100. Padding to the video's length gave 0 stalls in 150, with the same audio.*

## The wrong first guess

This showed up as a test that hung, not as a broken video somebody watched. The first theory was the input. ffmpeg listens on stdin by default, and the [ffmpeg documentation](https://ffmpeg.org/ffmpeg.html) says interaction on standard input is "on by default" unless you turn it off with `-nostdin`. A program that waits for a keypress inside an automated job will wait a long time, so it was a fair suspect.

It was a real trap, but it was not the one biting us. That was tested, not assumed: with stdin closed, the mixer still stalled. Forcing ffmpeg down to a single thread still stalled too. Giving the pad a length made the stalls stop. I keep relearning this lesson. When something stalls one time in 25, loop the exact call until it stalls again and narrow it down before you fix the thing you assumed. A guess that sounds right gets you a fix that also sounds right, and the stall keeps happening.

| Theory | What it predicts | What the loop showed |
|---|---|---|
| Waiting on keyboard input | Hangs whenever input is left open | Ruled out by test: with stdin closed, and with one thread forced, it still stalled. Still worth closing |
| Pad with no length | Stalls go away when the pad gets a length | Confirmed: bounded pad, same audio, 0 stalls in 150 runs. Inner cause still unknown |

## The fix: give everything a finish line

The fix went in over two changes, and none of it is clever.

1. **Give the silence a length.** Instead of "pad without limit and trim it back later," the filter now asks for a total duration that matches the video. The manual describes the `whole_dur` option as adding silence "until the value is reached." The track now ends on its own.
2. **Close the ear.** Every ffmpeg call in the render scripts starts with its input closed, so it cannot sit waiting for a keypress.
3. **Put a deadline on every call.** Each call runs through one small helper with a time limit. Node.js, which runs these scripts, supports that directly. Its [child process documentation](https://nodejs.org/api/child_process.html) describes `timeout` as "the maximum amount of time the process is allowed to run." The default here is generous, measured in minutes, and you can change it.
4. **Say why.** When the deadline hits, the call is stopped and the error names the tool and how long it waited. "Stalled, no exit after this many seconds, killed" is not a beautiful sentence, but it beats a blank screen by a mile.
5. **Keep it from coming back.** A test now fails if anyone adds an unbounded `apad` again, and another one fakes a hung ffmpeg to prove the stall message actually shows up.


Then the proof. In the mixer, bounding the pad gave the same audio and 0 stalls in 150 runs. A follow-up change bounded the same pattern in the other render scripts and ran each of them 50 times in a loop, with 0 stalls. It also ran the old filter and the new one side by side on short and long tracks: same decoded audio, hash for hash. I care about the "same audio" part as much as the "zero stalls" part, because a fix that changes how the films sound is just a new bug with better manners.

One footnote: the calls in two scripts that never pad audio were left outside this change. They do not use the filter tied to the hang, but they don't have the deadline either, and "every call" should mean every call.

## Failure modes worth stealing

| Pattern | What it looks like | Cheap guard |
|---|---|---|
| Default that runs forever | A filter or option that is "unbounded unless set" | Always set the length; add a test that fails on the unbounded form |
| Unbounded step, trimmed later | Pads without limit, then cuts back to length further down the same graph; sometimes stalled | Bound it where it starts; the later trim was not enough |
| Tool listening for input in a job | Runs fine by hand, freezes in automation | Close input on every call |
| No deadline | "Still running" and "dead" look the same | Time limit on every outside call |
| Silent kill | It stops, but nobody knows why | Error that names the tool and the wait |

## Check your own scripts

If you run renders, builds, or anything else that shells out to a command-line tool, this is a short checklist:

1. Search for options that are unlimited by default and set them on purpose.
2. Close standard input for anything that runs unattended.
3. Route every outside call through one helper that owns the deadline and the error message, so nobody forgets on the next script.
4. Loop the flaky call until it misbehaves before you fix it.
5. Prove the fix twice: the hang is gone, and the output did not change.

This matters more when agents are writing the code. "Pad, then trim" reads as correct and the audio comes out right, so nothing in a review flags it. It passed almost every run, and then roughly one in 25 just stopped talking, for reasons nobody has pinned down. That is why the guard is a test that fails on the unbounded form, not a hope that the next author knows.

## Bottom line

A hang is worse than a crash, because a crash at least tells you where to look. Give every outside call a finish line and a sentence to say when it gets there, and "it's stuck" turns back into "it stopped, and here's why."
