# Image-generating playbook

Short workflow for an agent that **proposes** covers and body images
for an existing post. Minutes. **Do not wire `[cover]` or commit
artwork in this pass.**

The post must already exist. Images come from its text, not a mood
board. Voice and claim rules:
[`authoring-guide.md`](authoring-guide.md),
[`claim-safe-facts.md`](claim-safe-facts.md).

If this session has no image-generation tool, say so and stop. Dave
supplies the file; you only place, compress, and wire it (see
[`platform-guide.md`](platform-guide.md)).

---

## Do this, in order

1. **Read the post.** Pull four or five visual beats that are already
   on the page (thesis, one real object, one factory-floor scene, a
   comparison only if the post has one). Do not invent a sixth theme.

2. **Generate five distinct options** — not five near-copies of one
   prompt. Use the slots below. Prefer 16:9 so any pick can be the
   cover. Night-console look: near-black `#0d0f0d`, console green
   `#5fb87a`, industrial / ops, not purple SaaS.

   | # | Job |
   |---|-----|
   | 1 | Cover A — the thesis as one picture |
   | 2 | Cover B — a different metaphor from the same post |
   | 3 | The real object the post names |
   | 4 | Factory floor (how the work actually looks) |
   | 5 | Comparison only if the draft already compares two sides |

3. **Hand Dave a pick-list.** Each row is a file + one line: what beat
   it is, and which sentence in the post it comes from.

   **TUI / terminal sessions cannot show session `images/N.jpg`
   links.** Copy the five files to
   `~/Desktop/<slug>-image-picks/` with numbered names (`1-…jpg`)
   and `open` the folder (Preview + Finder on macOS). Tell him that
   path. Do not ask him to decode a URL-encoded session directory.

4. **Stop.** Do not set `[cover]`, do not add `![]()`, do not commit
   candidates. Rejects stay out of git. Dave picks; a later turn
   wires only what he named.

---

## How to prompt (what actually worked)

Use the session image tool (`image_gen` in Grok / Imagine). One call
per option. Distinct prompts, not `n=5` on one idea. Do not fire a
whole post’s worth of calls in one burst — Imagine 429s. Two or three
at a time, then continue.

Write 2–5 sentences, **subject first**, then setting, then style:

- One physical object that stands in for the rule (locked hatch,
  crumpled note beside a free switch, stamp that fits block A and
  not block B, hand on a keyboard in an empty ops room).
- Photoreal / cinematic industrial. Night-console palette. Warm
  work light + one green lamp is enough.
- Almost **no readable type**. Models garble words and invent
  numbers. If the beat needs labels, that beat is an export
  (archify / HTML / SVG), not this tool.
- No people faces unless Dave gave a photo (`image_edit` +
  reference). Hands or a silhouette are fine.
- No “AI command center,” purple SaaS, HUD overlays, or logos.

Landing-floor example (thesis cover): *A heavy steel hatch set into
a dark factory floor, locked shut… one small console-green status
lamp… no robots, no people, no readable text.*

Dave’s “these are fantastic” bar was that recipe — one idea per
frame, grounded in a sentence he already wrote — not a labeled
infographic.

---

## Where to put the picks (after he chooses)

He may pick **more than one**. Typical shape: **one cover** + the
rest as body images. Do not force a single winner.

| Pick | Placement |
|------|-----------|
| Thesis / Cover A | `[cover]` in front matter. Replace a borrowed cover from another post. |
| Other picks | Inline `![]()` **immediately under the H2 they illustrate**, after the paragraph that states the beat. Same pattern as the boundaries post. |
| Rejects | Leave on the Desktop folder. Do not copy into `static/`. |

Naming: `static/images/posts/<slug>-<role>.jpg` (e.g.
`landing-floor-locked-hatch.jpg`). Alt text describes the object;
the title/caption is the rule in Dave’s voice, not “AI-generated
illustration.”

Do **not** change `date` or `draft` when wiring art. `make check`
fails if a file is missing or over 1MB (these 16:9 JPEGs have been
~200–280KB at 1280×720 — leave them unless a file is huge).

---

## Hard rules

- Ground every candidate in a sentence that is actually in the post.
- No invented metrics, board counts, or “N agents” on the image.
- No fake Dave face unless he handed you a photo.
- **Labeled architecture, permission lists, and exact numbers** are
  not image-gen jobs.
- Missing image-gen is not a prompt-engineering problem. Tell Dave
  and wait for a file.

---

## After he picks (wiring pass)

1. Copy only the named files to `static/images/posts/<slug>-<role>.jpg`.
2. Compress if needed (`sips` / `process_images.py`) so each file is
   under 1MB.
3. Set `[cover]` and/or inline `![]()` with honest alt + caption.
4. Branch, `make check`, PR. Do not change the post `date` or `draft`.
