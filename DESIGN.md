---
name: davevoyles.com
description: Light-first "console" theme on Hugo + PaperMod; warm paper, navy ink, console-green accent, mono chrome.
colors:
  canvas: "#faf9f4"
  surface: "#ffffff"
  ink: "#1a2744"
  content: "#243048"
  text-muted: "#546076"
  border: "#d6dcca"
  tertiary: "#d2e0c8"
  accent: "#22633c"
  accent-fg: "#faf9f4"
  warn-review: "#946418"
  error: "#a04038"
  blocked: "#b04040"
  human: "#25569c"
  verified: "#0f766e"
  infra: "#646c78"
  agent: "#6d50a0"
  code-bg: "#eaeee2"
  code-block-bg: "#1a2744"
  dark-canvas: "#0d0f0d"
  dark-accent: "#5fb87a"
typography:
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
  chrome:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 11vw, 6rem)"
rounded:
  sm: "4px"
  md: "8px"
  full: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
  8: "64px"
components:
  tag-pill:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.accent}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.content}"
    rounded: "{rounded.md}"
---

# Design System: davevoyles.com

Full prose snapshot with every token table: [docs/DESIGN.md](docs/DESIGN.md). This file is the short, agent-facing record. Source of truth is `assets/css/extended/00-tokens.css`; if they disagree, the CSS wins.

## Overview

**Creative North Star: "The Console Notebook"**

A calm, light-first reading surface with a terminal accent: warm paper canvas, near-navy ink, one console-green accent, monospace for structural text (logo, nav, titles, meta, TOC) and a plain system sans for long-form body. Dark is an opt-in toggle (`defaultTheme = "light"` in `hugo.toml`); OS dark preference does not set first paint.

**Key Characteristics:**
- Content first; chrome is quiet and mono.
- Status colors carry meaning with a label or pattern, never color alone (`10-visual-grammar.css`).
- Small, deliberate motion and WebGL that degrade to still frames.

## Colors

Values above are the light theme; dark overrides live in `00-tokens.css` (two blocks that must stay in sync).

- **Console Green** (`--ds-accent`): links, tag text, success, the `~/` logo prefix. Rare on any screen.
- **Warm Paper / White** (`--ds-canvas` / `--ds-surface`): page and card backgrounds.
- **Navy Ink** (`--ds-ink`, `--ds-content`, `--ds-text-muted`): headings, body, meta.
- **Role hues** (human blue, verified teal, review amber, blocked coral, infra gray, agent purple): diagrams, labels, status chips only.

**The Tokens Only Rule.** Raw colors live only in `00-tokens.css`; everything else uses `var(--ds-*)`. `scripts/check-ds-tokens.sh` (run by `make check`) enforces it.

## Typography

Body: system sans, 16px floor. Chrome and meta: mono stack. Display: self-hosted Geist (latin subset) on the hero. Scale `--ds-fs-1` to `--ds-fs-8` = 12, 14, 16, 18, 21, 26, 32, 48px, plus `--ds-fs-display`. No other web fonts.

## Layout

Persistent page shell: sidebar (240px) + content (900px) from 1024px, stacked below. Posts add a sticky TOC rail (280px). Breakpoints are only 640 / 1024 / 1440 (mobile-first). Spacing tokens `--ds-space-1..8` (4 to 64px).

## Elevation & Depth

Flat. Depth is borders (`--ds-border`) and tinted 1px rings, not drop shadows. List items use a 2px left rule that lights up in accent on hover/focus.

## Shapes

`--ds-radius-sm` 4px, `--ds-radius-md` 8px (cards, panels), `--ds-radius-full` pills (tags, buttons).

## Components

Tag pills, post/archive entries, sidebar bio card, TOC rail, series nav, related posts, backlinks, homepage ledger (hero, featured post, projects grid), About constellation. Defined in `assets/css/extended/custom.css` and `30-home.css`; layouts in `layouts/`. Motion tokens: `--ds-dur-fast/base/slow` (120/200/350ms), `--ds-ease-out`, `--ds-ease-in-out`. `prefers-reduced-motion` floor is in `00-tokens.css`.

## Shared parts

This repo ships its own `--ds-*` token set and does not use a visual-kit theme pack or material (no `data-pack`, no `data-material`). The studio UI shelf (`~/REPOS/studio/skills/ui`) is not wired in. Before hand-writing a button, input, card, modal, tabs, table or similar:

1. Reuse an existing class in `custom.css` / `30-home.css` first.
2. Otherwise run `node ~/REPOS/studio/skills/ui/scripts/ui-find.mjs "<need>"` and adapt the part to `--ds-*` tokens instead of improvising.

## Do's and Don'ts

- Do use `var(--ds-*)`; do not add raw hex/rgb outside `00-tokens.css`.
- Do not edit `themes/PaperMod/`; override in `layouts/` and `assets/`.
- Do pair hover with `:focus-within`/`:focus-visible`; keep the skip link.
- Do not add a web font, large soft shadows, or autoplay motion.
- Do use `--ds-fs-3` (16px) or larger for body content.
