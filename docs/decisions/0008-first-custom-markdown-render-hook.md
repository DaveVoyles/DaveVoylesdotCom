---
title: "Wikilink support introduces the site's first custom markdown render hook"
status: accepted
date: 2026-07-19
---

# 0008 — Wikilink support introduces the site's first custom markdown render hook

## Status

Accepted

## Context and Problem Statement

Plan 0004's Vault section is meant to feel like an actual Obsidian vault —
notes linked with `[[Note Title]]` syntax, the way ssp.sh's Second Brain
(itself sourced from a real Obsidian vault) works. Hugo's default markdown
renderer (Goldmark) has no built-in support for `[[wikilinks]]`; it only
understands standard `[text](url)` markdown links. Resolving `[[Note
Title]]` into a real `/vault/<slug>/` or `/posts/<slug>/` URL requires
intercepting Hugo's link-rendering step.

## Decision Drivers

- Wikilink syntax is the one piece of ssp.sh's authoring feel that's
  genuinely different from writing standard markdown links — frictionless,
  title-based linking is central to what makes a "vault" feel like a vault
  rather than just more blog posts with extra frontmatter.
- Standard markdown links (`[Note Title](/vault/note-title/)`) would work
  today with zero new code, at the cost of requiring the author to know and
  type the exact URL slug for every link, rather than just the note's title.
- Hugo supports markdown render hooks natively (`layouts/_default/_markup/`)
  as a supported extension point — this isn't a hack around the renderer,
  it's the documented mechanism for exactly this kind of customization.

## Considered Options

1. **Standard markdown links only** — no new code; authors write
   `[text](/vault/slug/)` by hand.
2. **Custom render hook for `[[wikilinks]]` (chosen)** — a new
   `layouts/_default/_markup/render-link.html` that pattern-matches
   `[[...]]` syntax and resolves it to the correct page at build time.
3. **Preprocessing script outside Hugo's build** — a separate script that
   rewrites `[[wikilinks]]` into standard markdown links before Hugo builds,
   run as a pre-build step.

## Decision Outcome

Chosen option: **custom render hook (option 2)**. `[[Note Title]]` resolves
to the correct page at Hugo's own build time, via the documented render-hook
extension point — no separate preprocessing step or external tooling.

### Consequences

- Good: authoring a vault note is frictionless — link by title, not by
  memorized/looked-up URL slug, matching the actual Obsidian-vault workflow
  that inspired this feature.
- Good: uses Hugo's own supported customization mechanism rather than a
  bolted-on preprocessing script that would need to run before every build
  (including local `hugo server` previews).
- Bad: this is the first custom markdown render hook in this codebase —
  a precedent that makes future markdown-rendering customizations (e.g.
  custom image handling, callout syntax) an easier sell than they would
  have been before this one landed, similar in kind to ADR 0005's framing
  for the site's first client-side JS dependency.
- Neutral: an unresolvable `[[wikilink]]` (typo, note doesn't exist yet)
  renders as plain text and logs a Hugo build warning, rather than either
  crashing the build or silently producing a broken link — so a missing
  target is visible without blocking every other page from building.
