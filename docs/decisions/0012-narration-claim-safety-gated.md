---
title: "Narration is claim-safety-gated content"
status: accepted
date: 2026-07-27
---

# 0012 — Narration is claim-safety-gated content

## Status

Accepted

## Context and Problem Statement

This site has an established claim-safety regime: a content gate that scans
markdown files for forbidden authorship claims before the build proceeds. The
gate is hard-fail — a build aborts if it detects a claim outside the
published claim-safe facts page, preventing unvetted first-person assertions
from going live.

The post-to-video pipeline (plan 0006) introduces a new surface for
first-person content — video narration, and on-screen headlines or text cards
in the video scenes. This content is public, spoken (even more salient than
written text for attribution), and carries the exact same risk class as
markdown prose.

Before this decision, narration was completely ungated. The existing
claim-safety mechanism scans markdown files only; it has no knowledge of the
video pipeline's scenes file or the narration strings it contains.

## Decision Drivers

- Extend the claim-safety regime to all public first-person content surfaces,
  not just markdown  
- Use the existing gate and claim-safe facts page as the single source of truth
  — do not invent a parallel safety mechanism  
- Make the gate reversible but explicit — an agent can draft narration
  constrained to claim-safe facts, but the gate itself is a mechanical check,
  not editorial judgment  
- Reduce the human review load by automating the claim check, not the entire
  narration approval  

## Considered Options

1. **No safety gate — treat narration as editorial content** — relies entirely
   on human review; scales poorly if narration frequency increases  
2. **Duplicate the claim-safe facts page as a narration manifest** — two sources
   of truth for the same facts; invite inconsistency  
3. **Extend the existing claim-safety gate to cover narration and on-screen
   text** — reuse the existing single source of truth, existing patterns, and
   existing test coverage  
4. **Create a new "narration safety" gate alongside the markdown gate** — dual
   mechanisms invite inconsistency and double the maintenance burden  

## Decision

**Option 3.** Extend the existing claim-safety gate.

The content gate is now wired to scan:

- All markdown files it already scans (unchanged)  
- The post-to-video scenes file's **narration strings**  
- The scenes file's **headline and on-screen card text** (equally salient as
  narration)  

Both scans use the same forbidden-claim patterns, applied via the same
single-source-of-truth claim-safe facts page. The gate is integrated into the
`make check` target and CI/CD, so any build that includes a video render or
scenes-file commit is automatically checked.

Implementation of the gate itself is detailed in plan 0006 deliverable D4
(issue #106).

## Consequences

### Positive

- Narration and on-screen text carry the same safety guarantee as markdown  
- No new single-source-of-truth pages or parallel safety rules to maintain  
- Mechanical check decouples claim-safety verification from editorial approval,
  allowing agents to draft constrained narration without blocking on human
  pre-review  
- Reuses existing test fixtures and patterns, lowering maintenance cost  

### Negative / tradeoffs

- The gate is claim-pattern-based, not editorial judgment — false negatives
  (claims that pass the gate but are undesirable) remain possible and still
  require human review of the rendered video  
- Claim-safe facts page changes propagate to narration gating immediately with
  no lag — intentional, but a future change to claim-safe facts will
  retroactively affect video narration drafts  
- Scenes file format now carries a hard safety requirement — future schema
  changes must preserve the narration and headline text fields, or they lose
  the gate  

## Related

- [Plan 0006 — Post-to-video pipeline](../design/0006-post-video-pipeline.md)
- [ADR 0011 — Video hosting is YouTube with a manual publish gate](0011-video-hosting-youtube-manual-publish-gate.md)
