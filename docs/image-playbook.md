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

3. **Hand Dave a pick-list.** Each row is a thumbnail + one line: what
   beat it is, and which sentence in the post it comes from.

4. **Stop.** Do not set `[cover]`, do not add `![]()`, do not commit
   candidates. Rejects stay out of git. Dave picks; a later turn
   compresses the winner under 1MB into `static/images/posts/`, wires
   the post, and runs `make check`.

---

## Hard rules

- Ground every candidate in a sentence that is actually in the post.
- No invented metrics, board counts, or “N agents” on the image.
- No fake Dave face unless he handed you a photo (`image_edit` +
  reference). Silhouette or hands are fine.
- **Labeled architecture, permission lists, and exact numbers** are
  not image-gen jobs. Export those (archify / HTML / SVG). Image
  models garble type and invent arrows.
- Missing image-gen is not a prompt-engineering problem. Tell Dave
  and wait for a file.

---

## After he picks (not this workflow)

1. Copy the winner to `static/images/posts/<slug>-<role>.jpg`.
2. Compress if needed (`process_images.py` / `sips`) so `make check`
   stays under 1MB.
3. Set `[cover]` and/or an inline `![]()` with honest alt text.
4. Branch, `make check`, PR. Do not change the post `date` or `draft`.
