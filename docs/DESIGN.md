# Design System — davevoyles.com

> Snapshot of this site's **current** design as implemented, documented so a designer or agent can understand the visual system without reading source. Updated 2026-08-14 for web-design-standards adoption (plan 0084 D12, issue #141). Shared structural rules: `~/.claude/skills/web-design-standards/SKILL.md`. Source of truth is always the files listed in §Source Files.

## At a Glance
| | |
|---|---|
| Live URL | https://davevoyles.com |
| Stack / framework | Hugo static site generator, theme [PaperMod](https://github.com/adityatelange/hugo-PaperMod) (git submodule under `themes/PaperMod/`) |
| Styling approach | CSS custom properties under `--ds-*` in `assets/css/extended/00-tokens.css` (loads first via Hugo `resources.Match` alpha concat). Component CSS in `assets/css/extended/custom.css` aliases PaperMod names onto those tokens. PaperMod base vars in `themes/PaperMod/assets/css/core/theme-vars.css` |
| Theme modes | Both light and dark, toggled via `data-theme="light"` / `data-theme="dark"` on `<html>` (PaperMod's built-in toggle button + `localStorage`, `themes/PaperMod/layouts/baseof.html`) |
| Overall vibe | A "console" theme layered on PaperMod's clean blog chrome: warm off-white/near-black backgrounds, a single green accent, and monospace type used deliberately for structural/meta text (nav, titles, post meta, TOC) so the site reads like a terminal/directory listing, while body copy stays a readable system sans-serif |

## Color Palette
Real values from code — never approximate. Canonical definitions live in `assets/css/extended/00-tokens.css` on `:root` (light / day console). Dark overrides exist twice and must stay in sync: `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` and `:root[data-theme="dark"]`. PaperMod/legacy names (`--theme`, `--entry`, `--accent`, …) still exist in `custom.css` as the migration alias layer.

### Light mode ("day console")
| Token / usage | Hex / RGB | Where defined | Notes |
|---|---|---|---|
| Background (`--ds-bg`) | `rgb(250, 249, 244)` → `#faf9f4` | `00-tokens.css` | Warm off-white, not pure white |
| Elevated / surface (`--ds-bg-elevated`, `--ds-surface`) | `rgb(255, 255, 255)` → `#ffffff` | `00-tokens.css` | Cards, sidebar bio, TOC panel |
| Text primary (`--ds-text`) | `rgb(24, 26, 22)` → `#181a16` | `00-tokens.css` | Near-black, slight green cast |
| Text muted (`--ds-text-muted`) | `rgb(90, 95, 83)` → `#5a5f53` | `00-tokens.css` | Meta text, labels |
| Content text (`--ds-content`) | `rgb(32, 35, 28)` → `#20231c` | `00-tokens.css` | Body copy |
| Tertiary (`--ds-tertiary`) | `rgb(210, 224, 200)` → `#d2e0c8` | `00-tokens.css` | Tag pill background |
| Border (`--ds-border`) | `rgb(214, 220, 202)` → `#d6dcca` | `00-tokens.css` | |
| Accent / link / success (`--ds-accent`, `--ds-link`, `--ds-success`) | `rgb(34, 99, 60)` → `#22633c` | `00-tokens.css` | Console green |
| Text on accent (`--ds-accent-fg`) | `rgb(250, 249, 244)` → `#faf9f4` | `00-tokens.css` | |
| Warn (`--ds-warn`) | `rgb(176, 128, 40)` → `#b08028` | `00-tokens.css` | |
| Error (`--ds-error`) | `rgb(160, 64, 56)` → `#a04038` | `00-tokens.css` | |
| Inline code (`--ds-code-bg`) | `rgb(234, 238, 226)` → `#eaeee2` | `00-tokens.css` | |
| Code block (`--ds-code-block-bg`) | `rgb(24, 26, 22)` → `#181a16` | `00-tokens.css` | Fenced blocks stay dark in light mode |

### Dark mode ("night console")
| Token / usage | Hex / RGB | Where defined | Notes |
|---|---|---|---|
| Background (`--ds-bg`) | `rgb(13, 15, 13)` → `#0d0f0d` | `00-tokens.css` dark blocks | |
| Elevated / surface (`--ds-bg-elevated`, `--ds-surface`) | `rgb(18, 22, 17)` → `#121611` | `00-tokens.css` dark blocks | |
| Text primary (`--ds-text`) | `rgb(239, 236, 224)` → `#efece0` | `00-tokens.css` dark blocks | |
| Text muted (`--ds-text-muted`) | `rgb(138, 143, 125)` → `#8a8f7d` | `00-tokens.css` dark blocks | |
| Content text (`--ds-content`) | `rgb(195, 192, 179)` → `#c3c0b3` | `00-tokens.css` dark blocks | |
| Tertiary (`--ds-tertiary`) | `rgb(38, 48, 38)` → `#263026` | `00-tokens.css` dark blocks | |
| Border (`--ds-border`) | `rgb(38, 48, 38)` → `#263026` | `00-tokens.css` dark blocks | |
| Accent / link / success (`--ds-accent`, `--ds-link`, `--ds-success`) | `rgb(95, 184, 122)` → `#5fb87a` | `00-tokens.css` dark blocks | Brighter green for dark backgrounds |
| Text on accent (`--ds-accent-fg`) | `rgb(13, 15, 13)` → `#0d0f0d` | `00-tokens.css` dark blocks | |
| Warn (`--ds-warn`) | `rgb(214, 168, 72)` → `#d6a848` | `00-tokens.css` dark blocks | |
| Error (`--ds-error`) | `rgb(214, 104, 96)` → `#d66860` | `00-tokens.css` dark blocks | |
| Inline code (`--ds-code-bg`) | `rgb(26, 32, 24)` → `#1a2018` | `00-tokens.css` dark blocks | |
| Code block (`--ds-code-block-bg`) | `rgb(18, 22, 17)` → `#121611` | `00-tokens.css` dark blocks | |

PaperMod's own unthemed defaults (not used, shown for contrast) live in `themes/PaperMod/assets/css/core/theme-vars.css` — light `--theme: rgb(255,255,255)`, `--primary: rgb(30,30,30)`; dark `--theme: rgb(29,30,32)`, `--primary: rgb(218,218,219)`. The site's `--ds-*` palette replaces these.

## Typography
| Role | Family | Size / scale | Weight | Where defined |
|---|---|---|---|---|
| Body copy | System sans stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif` | Browser default (~16px base), theme default line-height | Regular | `themes/PaperMod/assets/css/core/reset.css:27` (inherited, not overridden) |
| Structural / meta (logo, nav, post titles, post meta, breadcrumbs, archive headers, TOC, search results) | Monospace stack: `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace` | Type-scale tokens (`--ds-fs-1`–`--ds-fs-4` for chrome; display clamps on hero/About) | 400–600 | `assets/css/extended/custom.css` section 2 (selector list applying mono font to `.logo a`, `.menu a`, `.post-title`, `.entry-header h2`, `.post-meta`, `.entry-footer`, `.terms-tags a`, `.breadcrumbs`, `.page-header h1`, archive/search classes, `.related-posts-title`) |
| Series/TOC labels | Same monospace stack | `--ds-fs-1` / `--ds-fs-2` | 400 | `assets/css/extended/custom.css` section 3 |

Shared 8-step type scale lives on `:root` in `00-tokens.css` (do not change values): `--ds-fs-1` 0.75rem (12) through `--ds-fs-8` 3rem (48). Body floor for content is `--ds-fs-3` (16). Off-grid rem leftovers remain only for padding/positioning that is not an exact scale step. No custom `@font-face` / web fonts; system stacks only.

## Spacing & Layout
- **Grid / container:** `--gap` is aliased to `--ds-space-5` (24px) in the `custom.css` alias block. The site widens the content column with layout tokens in that same block:
  - `--main-width: 900px`
  - `--nav-width: 1440px`
  - `--sidebar-width: 240px`
  - `--toc-rail-width: 280px`
  - `.main` and `.footer` max-width = `main-width + sidebar-width + toc-rail-width + gap*4`
- **Page shell:** every page renders in a persistent CSS grid (`.page-shell`) — stacked by default, two columns (`sidebar-width` + `minmax(0,1fr)`) from `min-width: 1024px`. Applied via `layouts/_default/baseof.html`.
- **Post shell:** post pages use a further grid (`.post-shell`) — article then TOC stacked by default, article + sticky TOC rail from `min-width: 1024px`.
- **Breakpoints:** canonical set is **640 / 1024 / 1440**. Shells are mobile-first at 1024; remaining component queries use those three values (mostly `max-width`, look-preserving).
- **Spacing scale:** `--ds-space-1`–`--ds-space-8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px in `00-tokens.css`. PaperMod `--gap` aliases `--ds-space-5`. Exact-match rem paddings use the scale; off-grid leftovers stay literal.
- **Border radius:** identity tokens `--ds-radius-sm: 4px`, `--ds-radius-md: 8px`, `--ds-radius-full: 999px`. PaperMod `--radius: 8px` matches `--ds-radius-md`.
- **Shadow / elevation:** minimal and accent-tinted, not a neutral drop-shadow system — e.g. `box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 6%, transparent)` on the TOC panel (`assets/css/extended/custom.css:347`), and a focus-ring-style shadow on the avatar (`assets/css/extended/custom.css:568`). No large soft shadows/elevation levels anywhere.

## Components
- **Nav / logo:** `.logo a::before` injects a literal `~/` prompt prefix in accent color before the site title — a deliberate terminal-prompt affectation (`assets/css/extended/custom.css:59-64`).
- **Post list / archive entries:** `.post-entry`, `.archive-entry` get a 2px transparent left rule that lights up in `--accent` on hover/focus — the site's recurring "directory listing" hover pattern, reused identically for Related Posts and Backlinks lists (`assets/css/extended/custom.css:88-100`, `:170-178`, `:459-467`).
- **Tag pills:** background `--tertiary`, text `--accent`, 1px `--border` border (`assets/css/extended/custom.css:79-83`).
- **Sidebar bio card:** persistent left rail, `1px solid var(--border)` panel with `--radius`, avatar image, title, bio content, social icons (`assets/css/extended/custom.css:249-283`); collapses to a stacked card below 1024px.
- **Post TOC rail:** sticky right-hand panel styled as a distinct bordered "side panel" (uppercase monospace header, active-link highlight driven by `assets/js/toc-active.js` via IntersectionObserver) — permanently expanded on desktop (`min-width: 1024px`), click-to-expand `<details>` on narrower viewports.
- **Series nav / Related Posts / Backlinks:** three near-identical bottom-of-post widgets sharing the border-top + left-rule-hover-list pattern (`assets/css/extended/custom.css:105-207`, `:459-497`).
- **Buttons/pills (general):** `border-radius: var(--ds-radius-full)` pills with `var(--ds-dur-fast)` / `var(--ds-ease-out)` transitions.
- **Homepage-specific widgets** (not itemized individually here — see `docs/portfolio-surfaces.md`): featured/recent post cards, "currently building" strip, projects grid, topic rails, and a WebGL hero, all driven by `hugo.toml`'s `[params.home]` block and `layouts/index.html`.
- **About page:** interactive "agent constellation" graphic (`assets/js/about-constellation.js`) with an SVG fallback and WebGL variant, hidden under `prefers-reduced-motion`.

## Motion & Interaction
- Not a static site — several small, deliberate interactive/animated surfaces exist:
  - Homepage WebGL hero (`assets/js/home-hero-webgl.js`).
  - About-page "agent constellation" (`assets/js/about-constellation.js`), SVG + WebGL variants with per-element `transition` on stroke/fill/opacity/radius (e.g. `assets/css/extended/custom.css:818-853`).
  - Live TOC active-section highlighting via IntersectionObserver (`assets/js/toc-active.js`).
  - Instant client-side search (`assets/js/fastsearch.js`, PaperMod's fuse.js-based search).
- Shared motion tokens: `--ds-dur-fast` 120ms, `--ds-dur-base` 200ms, `--ds-dur-slow` 350ms; `--ds-ease-out` / `--ds-ease-in-out`. The mandatory blanket `@media (prefers-reduced-motion: reduce)` block lives in `00-tokens.css` (zeroes animation/transition duration sitewide).
- **Home hero reduced-motion:** `assets/js/home-hero-webgl.js` bails out when `matchMedia("(prefers-reduced-motion: reduce)")` matches; `custom.css` hides `.home-hero-webgl` (`display: none !important`) and disables card hover transforms under the same query, on top of the token-file floor.
- About constellation: WebGL canvas hidden and SVG fallback restored under `prefers-reduced-motion` (`custom.css` + `assets/js/about-constellation.js`).

## Imagery & Iconography
- **Icons:** PaperMod's built-in social icon set (`themes/PaperMod/assets/`) — the site currently wires up `linkedin` and `github` via `[[params.socialIcons]]` in `hugo.toml`.
- **Logo:** no image logo — the "logo" is text (`Dave Voyles`) with a CSS-injected `~/` prompt prefix (see Components above). No favicon override found in `static/` beyond Hugo/PaperMod defaults.
- **Avatar:** `/images/posts/Dave_Debbie.jpeg`, rendered in the sidebar bio card, circular via CSS.
- **Post/content images:** committed directly to `static/images/` (no LFS — see `docs/decisions/0002-images-committed-to-repo.md`), including a large batch of recovered legacy WordPress images (`static/images/www.davevoyles.com_wp-content_uploads_...`), served at `/images/<file>`.
- **Illustration style:** none beyond the generative SVG/WebGL "constellation" graphic on the About page — no custom illustration set.

## Accessibility Notes
- Reduced motion: sitewide floor in `00-tokens.css`; home hero already guarded in both JS (`home-hero-webgl.js` early return) and CSS (`.home-hero-webgl { display: none }`); About constellation likewise.
- `:focus-visible` is defined in `00-tokens.css` as a 2px `--ds-accent` outline with 2px offset. A skip-link (`.skip-link` → `#main-content`) sits at the top of `layouts/_default/baseof.html`. Component CSS still has extra accent-tinted `box-shadow` rings on select elements (e.g. avatar). Hover and `:focus-within` stay paired on list-style components.
- Color contrast was not measured numerically in this pass, but the palette is high-contrast by construction (near-black text on off-white in light mode, light text on near-black in dark mode); the green accent (`#22633c` light / `#5fb87a` dark) is used for both text and interactive affordances, which is worth a contrast check if it's ever used for small text on the tertiary tag-pill background.
- Body copy intentionally stays in the readable system sans font while only structural/meta text goes monospace — a good readability call for long-form posts (documented rationale in the CSS comment at `assets/css/extended/custom.css:36-38`).

## Known Inconsistencies / Design Debt
- **PaperMod aliases remain:** `custom.css` still defines `--theme` / `--entry` / `--accent` / etc. inside a `ds-alias-allow` block so the theme stylesheet keeps working. New CSS should use `--ds-*`.
- **Off-grid spacing leftovers:** exact scale steps (0.25/0.5/0.75/1/1.5rem) were remapped; other rem paddings stay literal so the look does not jump.
- **Component queries still mostly `max-width`:** shells are mobile-first at 1024; About/home grids still use look-preserving `max-width: 640px` / `1024px`.
- **Large single CSS file:** `custom.css` is now sectioned (alias / chrome / widgets / shell / About / home / shared a11y) but not split into partials.
- **Legacy image filenames:** many images under `static/images/` retain WordPress-export names (including stray double extensions).
- **No documented favicon/logo asset:** PaperMod/Hugo defaults plus the CSS-injected `~/` text logo.

## Source Files
- `hugo.toml` — site config, theme selection (`PaperMod`), homepage/menu/social params
- `assets/css/extended/00-tokens.css` — canonical `--ds-*` tokens (color, type, spacing, radius, motion) + mandatory reduce / `:focus-visible` floor
- `assets/css/extended/custom.css` — site override layer (console chrome, layout shell, components) + PaperMod aliases
- `scripts/check-ds-tokens.sh` — CI checker (`make check`); token file is the only place raw colors may live
- `themes/PaperMod/assets/css/core/theme-vars.css` — PaperMod's base CSS custom properties (`--gap`, `--radius`, default light/dark tokens), overridden by the site
- `~/.claude/skills/web-design-standards/SKILL.md` — shared structural standard (token roles, scales, breakpoints, theming, motion, a11y floor)
- `themes/PaperMod/assets/css/core/reset.css` — base reset and default body font stack
- `themes/PaperMod/layouts/baseof.html` — theme's `data-theme` attribute + dark/light toggle wiring
- `layouts/_default/baseof.html` — site's page-shell wrapper (sidebar + content grid) around PaperMod's base layout
- `layouts/index.html` — homepage dashboard/magazine layout
- `assets/js/home-hero-webgl.js`, `assets/js/about-constellation.js`, `assets/js/toc-active.js`, `assets/js/fastsearch.js` — interactive/motion behavior
- `docs/platform-guide.md` — existing prose documentation of the console theme and CSS variable conventions
- `docs/portfolio-surfaces.md` — existing documentation of homepage/About/graph/WebGL surfaces
- `docs/decisions/0002-images-committed-to-repo.md` — image-handling convention
