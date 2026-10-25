---
name: davevoyles.com
description: Dark-only "console" theme on Hugo + PaperMod; green-black canvas, mint ink, console-green accent, mono chrome.
colors:
  canvas: "rgb(10, 15, 12)"
  surface: "rgb(16, 24, 19)"
  ink: "rgb(232, 241, 234)"
  content: "rgb(195, 211, 200)"
  text-muted: "rgb(147, 166, 154)"
  border: "rgb(31, 47, 37)"
  tertiary: "rgb(31, 47, 37)"
  accent: "rgb(127, 211, 154)"
  accent-fg: "rgb(10, 15, 12)"
  warn: "rgb(214, 168, 72)"
  error: "rgb(214, 104, 96)"
  human: "rgb(110, 168, 230)"
  verified: "rgb(80, 196, 184)"
  review: "rgb(232, 176, 80)"
  blocked: "rgb(232, 120, 112)"
  infra: "rgb(160, 168, 176)"
  agent: "rgb(176, 148, 220)"
  code-bg: "rgb(20, 32, 25)"
  code-block-bg: "rgb(16, 24, 19)"
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

**Creative North Star: "The Night Console"**

A calm, dark-only reading surface with a terminal accent: green-black canvas, soft mint ink, one console-green accent, monospace for structural text (logo, nav, titles, meta, TOC) and a plain system sans for long-form body. There is one theme: `hugo.toml` sets `defaultTheme = "dark"` and `disableThemeToggle = true` (issue #184). Do not add a light theme or a toggle.

**Key Characteristics:**
- Content first; chrome is quiet and mono.
- Status colors carry meaning with a label or pattern, never color alone (`10-visual-grammar.css`).
- Small, deliberate motion and WebGL that degrade to still frames.

## Colors

Values above are the single `:root` block in `00-tokens.css` (`color-scheme: dark`). There are no light overrides; the file also holds hero, button and overlay roles (`--ds-hero-*`, `--ds-btn-*`, `--ds-overlay`).

- **Console Green** (`--ds-accent`): links, tag text, success, the `~/` logo prefix. Rare on any screen.
- **Green-Black Canvas / Surface** (`--ds-canvas` / `--ds-surface`): page and card backgrounds.
- **Mint Ink** (`--ds-ink`, `--ds-content`, `--ds-text-muted`): headings, body, meta.
- **Role hues** (human blue, verified teal, review amber, blocked coral, infra gray, agent purple): diagrams, labels, status chips only.

**The Tokens Only Rule.** Raw colors live only in `00-tokens.css`; everything else uses `var(--ds-*)`. `scripts/check-ds-tokens.sh` (run by `make check`) enforces it.

## Typography

Body: system sans, 16px floor. Chrome and meta: mono stack. Display: self-hosted Geist (latin subset) on the hero. Scale `--ds-fs-1` to `--ds-fs-8` = 12, 14, 16, 18, 21, 26, 32, 48px, plus `--ds-fs-display`. No other web fonts.

## Layout

Persistent page shell: sidebar (240px) + content (900px) from 1024px, stacked below. Posts add a sticky TOC rail (280px). Breakpoints are only 640 / 1024 / 1440 (mobile-first). Spacing tokens `--ds-space-1..8` (4 to 64px).

## Elevation & Depth

Mostly flat. Depth is borders (`--ds-border`) and faint accent-tinted rings. Two large shadows exist: the command-palette box `.cmdk-box` (`0 30px 80px var(--ds-shadow-lg)`, `zz-dark-interactive.css`) and the image lightbox `.post-lightbox` (`0 24px 48px` at 35% `--ds-text`, `custom.css`). List items use a 2px left rule that lights up in accent on hover/focus.

## Shapes

`--ds-radius-sm` 4px, `--ds-radius-md` 8px (cards, panels), `--ds-radius-full` pills (tags, buttons).

## Components

Tag pills, post/archive entries, sidebar bio card, TOC rail, series nav, related posts, backlinks, homepage ledger (hero, featured post, projects grid), About constellation. Defined in `assets/css/extended/custom.css`, `30-home.css` and `zz-dark-interactive.css`; layouts in `layouts/`. Motion tokens: `--ds-dur-fast/base/slow` (120/200/350ms), `--ds-ease-out`, `--ds-ease-in-out`. `prefers-reduced-motion` floor is in `00-tokens.css`.

## Shared parts

This repo ships its own `--ds-*` token set and does not use a visual-kit theme pack or material (no `data-pack`, no `data-material`). The studio UI shelf (`~/REPOS/studio/skills/ui`) is not wired in. Before hand-writing a button, input, card, modal, tabs, table or similar:

1. Reuse an existing class in `custom.css` / `30-home.css` first.
2. Otherwise run `node ~/REPOS/studio/skills/ui/scripts/ui-find.mjs "<need>"` and adapt the part to `--ds-*` tokens instead of improvising.

## Do's and Don'ts

- Do use `var(--ds-*)`; do not add raw hex/rgb outside `00-tokens.css`.
- Do not edit `themes/PaperMod/`; override in `layouts/` and `assets/`.
- Do pair hover with `:focus-within`/`:focus-visible`; keep the skip link.
- Do not add a web font (Geist is the only one), new large shadows beyond those two, a light theme, or autoplay motion.
- Do use `--ds-fs-3` (16px) or larger for body content.
