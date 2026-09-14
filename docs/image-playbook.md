# Image-generating playbook

Short workflow for **new covers and mechanism diagrams** on
davevoyles.com. Minutes. **Do not wire `[cover]` or commit artwork
until a winner is named.**

The post (or draft) must already exist. Images come from its text,
not a mood board. Voice and claim rules:
[`authoring-guide.md`](authoring-guide.md),
[`claim-safe-facts.md`](claim-safe-facts.md).

---

## Default path (Dave lock 2026-09-14)

Every **new** cover or mechanism image:

1. **Blog** generates **3 design variants** (HTML→PNG / Archify / image-gen — whatever fits the beat).
2. Blog posts the three options in the **Engineering** room (link + what each variant is + what Dave gets).
3. **Engineer + Roberto** pick the best in-room (keep / fix / redo energy on the pick).
4. **Blog** lands the winner on the draft PR (or asks Engineer to swap the file). Dave can override any pick.

Desktop pick-lists (`~/Desktop/<slug>-image-picks/`) are **optional scratch** only — not the default review surface. Dave reviews real theme via MacBook `make preview` on the draft PR when content is in flight.

**Unique cover:** never reuse the cover file as a body image in the same post.

**Visual cadence:** roughly one image/diagram/table per **~3 paragraphs** of body prose so the post does not read as a wall of text. Cover does not replace body beats.

---

## Do this, in order

1. **Read the post.** Pull the visual beats already on the page (thesis,
   mechanism, comparison). Do not invent a sixth theme.

2. **Generate three distinct variants** — not three near-copies.
   Prefer lighter, brighter palettes unless the beat is ops /
   fail-closed (night-console still valid then). Not purple SaaS.

   | # | Job (examples) |
   |---|-----|
   | A | Clearest ELI10 / teaching layout |
   | B | Editorial / magazine feel (e.g. big-number poster) |
   | C | Minimal / reusable house-standard candidate |

   For photoreal covers, three metaphors from the post beat five
   near-copies. For labeled architecture, use HTML/Archify/SVG exports
   — not image-gen with fake readable type.

3. **Post the three in Engineering.** Each row: file (or preview) +
   one line what beat it is + which sentence it comes from. Tag
   Engineer and Roberto for the pick.

4. **Stop wiring until a winner.** Do not set `[cover]`, do not add
   `![]()`, do not commit all three candidates to `static/`. Rejects
   stay out of git. After the room (or Dave) names a winner, wire
   only that file.

---

## Mechanism diagram styles (approved examples)

Use these as starting points, not a closed set:

- **V2 poster** — big numbers, magazine / editorial (locked for the
  Second Brain “three failures” diagram).
- **Hub-A vertical spine** — SoT spelled out as “source of truth” on
  the figure; light canvas; one cool spine, not a rainbow of boxes.
- Timeline / before-after / hub+satellites remain useful critique
  axes when proposing the next three.

Crop empty whitespace before shipping. Prefer light `#f7f9fc`-family
backgrounds for adoption posts.

---

## Visual grammar (Post Standard v1.1)

Canonical role colors for mechanism diagrams. Vault:
[Blog Post Standard](https://github.com/DaveVoyles/MainVault/blob/main/20-Areas/Personal/blog-post-standard-v1.md)
(`ef4d637`). Pipeline locks in [`authoring-guide.md`](authoring-guide.md)
still win. **Labels + patterns, not color alone.**

| Color | Means |
|-------|--------|
| Blue | Human |
| Teal | Verified |
| Amber | Review |
| Coral | Blocked |
| Gray | Infra |
| Purple | Agent |

Pointer only — do not change theme/CSS or site chrome for this.

---

## How to prompt (photoreal covers)

When the beat is a photoreal cover (not a labeled diagram), use the
session image tool. One call per option. Distinct prompts. Do not
fire a whole post’s worth in one burst — rate limits bite. Two or
three at a time.

Write 2–5 sentences, **subject first**, then setting, then style:

- One physical object that stands in for the rule.
- Photoreal. Ground the picture in a sentence from the post.
- **Palette follows the post.** Prefer lighter when the piece is
  exec adoption / optimism; keep night-console for ops floor /
  fail-closed.
- Almost **no readable type**. If the beat needs labels, that beat
  is an export (Archify / HTML / SVG).
- No people faces unless Dave gave a photo. No fake Dave face.
- No “AI command center,” purple SaaS, HUD overlays, or logos.

Deliver the three options via **Engineering**, not a Desktop folder
as the primary path.

---

## Where to put the winner (after the pick)

Typical shape: **one cover** + body mechanism images. Cover file must
not also appear inline.

| Pick | Placement |
|------|-----------|
| Cover | `[cover]` in front matter. Do **not** also inline the same file. |
| Body / mechanism | Inline `![]()` **immediately under the H2 they illustrate**, after the paragraph that states the beat. |
| Rejects | Leave out of `static/`. Do not commit. |

Naming: `static/images/posts/<slug>-<role>.png` (or `.jpg`). Alt text
describes the object; caption is the rule in Dave’s voice.

Do **not** change `date` or `draft` when wiring art unless the publish
pass explicitly says so. `make check` fails if a file is missing or
over 1MB.

---

## Hard rules

- Ground every candidate in a sentence that is actually in the post.
- Three variants → Engineering → Engineer+Roberto pick → Blog wires.
  Dave can override.
- Unique cover (never also a body image).
- Photoreal covers: almost no readable type. No fake Dave face.
- Labeled architecture / permission lists / exact numbers are
  export jobs, not image-gen.
- No invented metrics or “N agents” baked into pixels.
- Missing image-gen is not a prompt-engineering problem — say so and
  wait for a file or use HTML/Archify.

---

## After the winner is named (wiring pass)

1. Copy only the named file to `static/images/posts/<slug>-<role>…`.
2. Compress if needed (`sips` / `process_images.py`) under 1MB.
3. Set `[cover]` and/or inline `![]()` with honest alt + caption.
4. Branch, `make check`, PR (or push onto the existing draft PR).
   Do not change `date` / `draft` unless this is the publish pass.
