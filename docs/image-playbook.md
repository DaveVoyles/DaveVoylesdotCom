# Image playbook

How to make a figure or a cover for davevoyles.com. Figures are
dark, built from HTML and SVG on the site's own `--ds-*` colour
tokens. Covers are one object and no words. Voice and claim rules
live in [`authoring-guide.md`](authoring-guide.md) and
[`claim-safe-facts.md`](claim-safe-facts.md). Plan:
[`design/0008-blog-voice-and-visuals.md`](design/0008-blog-voice-and-visuals.md)
(card D6).

The post must already exist. Images come from its text, not a mood
board.

## The kit

Everything lives in [`figure-kit/`](figure-kit/).

| File | What it is |
|---|---|
| `figure-kit/kit.css` | The figure styles. Colours are `var(--ds-*)` only, no raw values. |
| `figure-kit/figure-template.html` | The starting file. Copy it, change the text. |
| `figure-kit/render.mjs` | Renders a figure or cover to PNG at 2x with Playwright and Chrome. |
| `figure-kit/posts/` | The sources of the figures that ship, one HTML file per image. |

Rules the kit enforces:

- **Dark canvas, mint ink.** The canvas is `--ds-canvas`, text is
  `--ds-ink`, and panels sit on `--ds-surface`. No white or pastel
  cards. The site is dark-only, so a light figure looks pasted on.
- **Six role colours, each with a label.** Human is blue, verified
  is teal, review is amber, blocked is coral, infra is gray, agent is
  purple (`--ds-human`, `--ds-verified`, `--ds-review`,
  `--ds-blocked`, `--ds-infra`, `--ds-agent`). Every box carries a
  `.tag` label with the role name, so colour is never the only
  signal. Use only the roles the figure needs.
- **One type family.** The body sans stack from `kit.css`. No second
  font, no web font.
- **Designed at 800 CSS pixels wide, exported at twice that**
  (1600 px). The size check in `make check` (1 MB per file) still
  applies; run a heavy PNG through `sips` or `process_images.py`.
- **Smallest label 14 CSS pixels** (the role `.tag`). Box titles are
  18 to 22, detail lines 16. If a label will not fit at 14, cut
  words, do not shrink type.
- **Few words, one claim.** The figure title states the claim flat.
  Boxes hold two or three words each. Prose belongs in the post.

Render a figure:

```
PW_DIR=<dir whose node_modules has playwright> \
  node docs/figure-kit/render.mjs docs/figure-kit/posts/<slug>-<role>.html static/images/posts/<slug>-<role>.png
```

## The cover rule

A cover is **one object, no words, 16 by 9**.

- One object that stands in for the post's rule (a tray, a bar, a
  button). Not a diagram, not a collage.
- No text, no numbers, no logos, no faces. If the beat needs labels
  it is a figure and goes in the body.
- 16 by 9, designed at 800 by 450 and exported at 1600 by 900, as
  `static/images/posts/<slug>-cover.png`. Wire it with `[cover]`.
- Also export the **1200 by 630 social crop** as
  `static/images/posts/<slug>-cover-social.png`: crop the 16 by 9
  design to 800 by 420 around the object (`render.mjs --crop
  800x420`), then resize to 1200 by 630. Keep the object inside the
  middle 800 by 420 so the crop never cuts it.
- Alt text describes the object and says what it stands for. The
  caption is the rule in Dave's voice.
- A cover never also appears in the body.

## One real artifact per post

Every post carries at least one real artifact: a code snippet, a log
line, a redacted screenshot or a measured number. A figure of boxes
and arrows does not count. The artifact goes in the body where the
claim needs it; a figure can sit beside it but not replace it. If a
post has nothing real to show, the post is not ready.

## Process: three variants, one winner

1. **Read the post.** Pull the visual beats already on the page.
   Ground each candidate in a sentence that is in the post.
2. **Make three distinct variants** from the kit, not three
   near-copies. For a cover that means three different objects or
   compositions. Keep them outside the repo (scratch folder) or in
   the pull request description as a table.
3. **Pick one and say why.** Name the winner in the pull request in
   one line. Dave can override.
4. **Wire only the winner.** Commit the winner's PNG and its HTML
   source. Rejects stay out of git. Set `[cover]` or inline
   `![]()` with honest alt text.
5. **Put a figure under the H2 it illustrates**, after the paragraph
   that states the beat. Roughly one image, table or code block per
   three paragraphs so the post is not a wall of text.

Naming: `static/images/posts/<slug>-<role>.png`.

Do not change `date` or `draft` when wiring art unless the publish
pass says so. `make check` fails if a file is missing or over 1 MB.

## Proof before the pull request

Open the rendered post at 390 and 1440 pixels (the **ui-proof**
skill, with real device emulation for the narrow shot, not a
narrow headless window). Every label must be legible. At 390 pixels a
figure scales to about 45 percent, so tapping the image opens the
full-size lightbox; keep titles and boxes large enough that the
claim reads without it.

## Hard rules

- Dark only, on `--ds-*` tokens. No raw colour values.
- Labelled architecture, permission lists and exact numbers are
  HTML or SVG exports, never image-gen with fake readable type.
- No invented metrics, no "N agents" baked into pixels.
- No fake Dave face. No purple SaaS, HUD overlays or logos.
- Unique cover. Rejects never enter git.
