---
title: "Video hosting is YouTube with a manual publish gate"
status: accepted
date: 2026-07-27
---

# 0011 — Video hosting is YouTube with a manual publish gate

## Status

Accepted

## Context and Problem Statement

The post-to-video pipeline (plan 0006) needs a hosting strategy for generated
MP4 files. The spike that proved the feasibility of local deterministic renders
self-hosted the output in the site's static directory — a quick path for
experimentation, but not viable for production.

GitHub Pages, the deploy target for davevoyles.com, is not a general-purpose
media host:

- Hard 100 MB file size cap per file  
- Soft 1 GB per-site quota  
- Terms of service explicitly discourage media hosting  

The site has never tracked a video file; its largest committed asset today is a
4.6 MB PNG. Scaling video narration to regular use would require external hosting.

## Decision Drivers

- Reduce friction on local experimentation — no external upload APIs during
  prototyping  
- Host finished videos on an established, production-ready platform with strong
  playback and analytics  
- Maintain a human control point before public release — an intermediary gate
  that Dave operates, not automated end-to-end publishing  
- Avoid compliance overhead — do not pursue external audit processes to lift
  API restrictions  

## Considered Options

1. **Self-host on a cloud storage bucket** (S3, GCS, Backblaze, etc.) — gives
   full control, but adds infrastructure, credential management, and a monthly
   cost for storage + bandwidth  
2. **Host on YouTube** — established platform, built-in analytics, strong
   playback compatibility, free tier; API uploads to *private* visibility with
   a human approval gate before moving to unlisted/public  
3. **Embed a third-party video platform** (Vimeo, Wistia) — production-ready but
   monthly cost and added dependency  
4. **No dedicated hosting — link to in-repo renderings** — avoids external
   infrastructure but regresses to the GitHub Pages scaling problem and runs
   counter to the goal of public video narration  

## Decision

**Option 2.** Host all generated narration videos on YouTube.

The upload API is configured to **upload as PRIVATE and stop** — a deliberate
gate, not an unfinished feature. Dave manually reviews the video in YouTube
Studio and flips the visibility to unlisted or public if he approves.

**Important:** Google's YouTube Data API carries a restriction that affects
this decision:

> All videos uploaded via the videos.insert endpoint from unverified API
> projects created after 28 July 2020 will be restricted to private viewing
> mode.

This is a hard constraint from Google, not a software bug. YouTube's compliance
audit process can lift this restriction for verified projects, but pursuing
that audit was explicitly evaluated and **rejected during the 2026-07-27
grilling session for plan 0006** — the manual visibility flip is the accepted,
permanent design, not a temporary workaround or stopgap waiting for a
certificate.

## Consequences

### Positive

- Zero infrastructure overhead — no self-hosted storage, CDN, or cost  
- Established platform with strong uptime, playback, and analytics  
- Built-in privacy model (private → unlisted → public) matches the desired gate  
- Recovers from API credential leaks via token rotation, which YouTube handles
  natively  

### Negative / tradeoffs

- Adds a manual human step to every public video — Dave must visit YouTube
  Studio  
- API quota restrictions apply (350 uploads/day per account; recovers daily at
  midnight Pacific)  
- YouTube's Terms of Service govern the hosted content (unlikely to affect
  technical posts, but notable)  
- If Google's compliance restrictions tighten further, no relief valve exists
  short of a self-hosted fallback  

## Related

- [Plan 0006 — Post-to-video pipeline](../design/0006-post-video-pipeline.md)
- [ADR 0012 — Narration is claim-safety-gated content](0012-narration-claim-safety-gated.md)
