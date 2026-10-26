# Design System — davevoyles.com

> Snapshot of this site's **current** design as implemented, documented so a designer or agent can understand the visual system without reading source. Updated 2026-10-25 for the dark-only theme (issue #184) + Post Standard v1.1 tokens. Shared structural rules: `~/.claude/skills/web-design-standards/SKILL.md`. Source of truth is always the files listed in §Source Files.

## At a Glance
| | |
|---|---|
| Live URL | https://davevoyles.com |
| Stack / framework | Hugo static site generator, theme [PaperMod](https://github.com/adityatelange/hugo-PaperMod) (git submodule under `themes/PaperMod/`) |
| Styling approach | CSS custom properties under `--ds-*` in `assets/css/extended/00-tokens.css` (loads first via Hugo `resources.Match` alpha concat). Component CSS in `assets/css/extended/custom.css` aliases PaperMod names onto those tokens. PaperMod base vars in `themes/PaperMod/assets/css/core/theme-vars.css` |
| Theme modes | **Dark only.** `defaultTheme = "dark"` and `disableThemeToggle = true` in `hugo.toml`; `layouts/_default/baseof.html` renders `data-theme="dark"`. No light theme, no toggle. |
| Overall vibe | Dark "Night Console": green-black canvas, soft mint ink, console-green accent, monospace for structural/meta text (nav, titles, post meta, TOC). Body copy stays a readable system sans-serif. |

## Color Palette
Real values from code. Canonical definitions are the single `:root` block (`color-scheme: dark`) in `assets/css/extended/00-tokens.css`; there are no light or `prefers-color-scheme` overrides. PaperMod/legacy names (`--theme`, `--entry`, `--accent`, ...) are aliased onto these in `custom.css`. Visual grammar labels/patterns: `assets/css/extended/10-visual-grammar.css`.

### Core tokens (dark, the only theme)
| Token / usage | Value | Notes |
|---|---|---|
| Canvas (`--ds-canvas`, `--ds-bg`) | `rgb(10, 15, 12)` | Green-black page background |
| Surface (`--ds-surface`, `--ds-bg-elevated`) | `rgb(16, 24, 19)` | Cards, sidebar bio, TOC panel |
| Ink (`--ds-ink`, `--ds-text`) | `rgb(232, 241, 234)` | Mint ink, headings |
| Text muted (`--ds-text-muted`) | `rgb(147, 166, 154)` | Meta text, labels |
| Content text (`--ds-content`) | `rgb(195, 211, 200)` | Body copy |
| Tertiary (`--ds-tertiary`) | `rgb(31, 47, 37)` | Tag pill background |
| Border (`--ds-border`) | `rgb(31, 47, 37)` | Same value as tertiary |
| Accent / link / success (`--ds-accent`, `--ds-link`, `--ds-success`) | `rgb(127, 211, 154)` | Console green |
| Text on accent (`--ds-accent-fg`) | `rgb(10, 15, 12)` | Same as canvas |
| Warn (`--ds-warn`) | `rgb(214, 168, 72)` | Amber |
| Review (`--ds-review`) | `rgb(232, 176, 80)` | Amber, role hue |
| Error (`--ds-error`) | `rgb(214, 104, 96)` | |
| Blocked (`--ds-blocked`) | `rgb(232, 120, 112)` | Coral |
| Human (`--ds-human`) | `rgb(110, 168, 230)` | Blue |
| Verified (`--ds-verified`) | `rgb(80, 196, 184)` | Teal |
| Infra (`--ds-infra`) | `rgb(160, 168, 176)` | Gray |
| Agent (`--ds-agent`) | `rgb(176, 148, 220)` | Purple |
| Inline code (`--ds-code-bg`) | `rgb(20, 32, 25)` | |
| Code block (`--ds-code-block-bg`) | `rgb(16, 24, 19)` | Same as surface |

### Hero, button and overlay roles
Also on `:root`: `--ds-hero-glow-a/b`, `--ds-hero-scrim`, `--ds-hero-scrim-soft`, `--ds-hero-shadow`, `--ds-hero-title-from/to` (`#f2fbf4` to `#22d3ee`), `--ds-btn-bg` (`#1f6b3c`), `--ds-btn-bg-hover` (`#26834b`), `--ds-btn-border` (`#2a8a4f`), `--ds-on-btn`, `--ds-spot`, `--ds-mask`, `--ds-overlay`, `--ds-box-border` (`#2a4435`), `--ds-shadow-lg` (`rgba(0, 0, 0, 0.6)`, a shadow colour, used in `zz-dark-interactive.css`).

PaperMod's own unthemed defaults (overridden, shown for contrast) live in `themes/PaperMod/assets/css/core/theme-vars.css` — light `--theme: rgb(255,255,255)`, `--primary: rgb(30,30,30)`; dark `--theme: rgb(29,30,32)`, `--primary: rgb(218,218,219)`. The site's `--ds-*` palette replaces these.

## Typography
| Role | Family | Size / scale | Weight | Where defined |
|---|---|---|---|---|
| Body copy | System sans stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif` | `--ds-fs-3` (16px) floor, theme default line-height | Regular | `themes/PaperMod/assets/css/core/reset.css:27` (inherited, not overridden) |
| Structural / meta (logo, nav, post titles, post meta, breadcrumbs, archive headers, TOC, search results) | Monospace stack: `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace` | Type-scale tokens (`--ds-fs-1`–`--ds-fs-4` for chrome; display clamps on hero/About) | 400–600 | `assets/css/extended/custom.css` section 2 (selector list applying mono font to `.logo a`, `.menu a`, `.post-title`, `.entry-header h2`, `.post-meta`, `.entry-footer`, `.terms-tags a`, `.breadcrumbs`, `.page-header h1`, archive/search classes, `.related-posts-title`) |
| Hero display | `--ds-font-display`: `"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` (self-hosted latin subset) | `--ds-fs-display` = `clamp(3rem, 11vw, 6rem)` | 500-800 | `00-tokens.css` (`@font-face`, preloaded in `layouts/partials/extend_head.html`) |
| Series/TOC labels | Same monospace stack | `--ds-fs-1` / `--ds-fs-2` | 400 | `assets/css/extended/custom.css` section 3 |

Shared 8-step type scale lives on `:root` in `00-tokens.css` (do not change values): `--ds-fs-1` 0.75rem (12) through `--ds-fs-8` 3rem (48). Body floor for content is `--ds-fs-3` (16). Off-grid rem leftovers remain only for padding/positioning that is not an exact scale step. Geist (hero display only) is the single web font; everything else uses system stacks.

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
- **Shadow / elevation:** mostly flat; depth is borders (`--ds-border`) plus faint accent-tinted rings, e.g. the TOC panel (`.post-toc-rail details.toc`: `0 0 0 1px` at 6% accent) and the About hero photo (`.about-hero-photo`: `0 0 0 4px` at 12% accent plus a 2px accent-mixed border). Two large shadows exist: the command palette `.cmdk-box` (`0 30px 80px var(--ds-shadow-lg)`, `zz-dark-interactive.css`) and the image lightbox `.post-lightbox` (`0 var(--ds-space-5) var(--ds-space-7)` at 35% `--ds-text`, `custom.css`). No other elevation levels.

## Components
- **Nav / logo:** `.logo a::before` injects a literal `~/` prompt prefix in accent color before the site title — a deliberate terminal-prompt affectation (`custom.css`, `.logo a::before`).
- **Post list / archive entries:** `.post-entry`, `.archive-entry` get a 2px transparent left rule that lights up in `--accent` on hover/focus — the site's recurring "directory listing" hover pattern, reused identically for Related Posts and Backlinks lists (`custom.css`, `.post-entry` / `.archive-entry`).
- **Tag pills:** background `--tertiary`, text `--accent`, 1px `--border` border (`custom.css`, `.terms-tags a`).
- **Sidebar bio card:** persistent left rail, `1px solid var(--border)` panel with `--radius`, avatar image, title, bio content, social icons (`custom.css`, sidebar bio); collapses to a stacked card below 1024px.
- **Post TOC rail:** sticky right-hand panel styled as a distinct bordered "side panel" (uppercase monospace header, active-link highlight driven by `assets/js/toc-active.js` via IntersectionObserver) — permanently expanded on desktop (`min-width: 1024px`), click-to-expand `<details>` on narrower viewports.
- **Series nav / Related Posts / Backlinks:** three near-identical bottom-of-post widgets sharing the border-top + left-rule-hover-list pattern (`custom.css`).
- **Chips/pills:** `.ledger-chips a` (`30-home.css`) uses `border-radius: var(--ds-radius-full)` with `var(--ds-dur-fast)` border/color transitions; `.ds-label--verified::before` (`10-visual-grammar.css`) is also `--ds-radius-full`.
- **Homepage-specific widgets** (not itemized individually here — see `docs/portfolio-surfaces.md`): featured/recent post cards, "currently building" strip, projects grid, topic rails, and a WebGL hero, all driven by `hugo.toml`'s `[params.home]` block and `layouts/index.html`.
- **About page:** interactive "agent constellation" graphic (`assets/js/about-constellation.js`) with an SVG fallback and WebGL variant, hidden under `prefers-reduced-motion`.

## Motion & Interaction
- Not a static site — several small, deliberate interactive/animated surfaces exist:
  - Homepage hero: the shader-loop motion look in an iframe (`assets/js/home.js`, `static/motion/looks/shader-loop/`).
  - About-page "agent constellation" (`assets/js/about-constellation.js`), SVG + WebGL variants with per-element `transition` on stroke/fill/opacity/radius (`custom.css`, `.about-constellation-edge` and `.about-constellation-dot`).
  - Live TOC active-section highlighting via IntersectionObserver (`assets/js/toc-active.js`).
  - Instant client-side search (`assets/js/fastsearch.js`, PaperMod's fuse.js-based search).
- Shared motion tokens: `--ds-dur-fast` 120ms, `--ds-dur-base` 200ms, `--ds-dur-slow` 350ms; `--ds-ease-out` / `--ds-ease-in-out`. The mandatory blanket `@media (prefers-reduced-motion: reduce)` block lives in `00-tokens.css` (zeroes animation/transition duration sitewide).
- **Home hero reduced-motion:** the look shows one still frame and waits for its play button; it also pauses off-screen and is skipped when Save-Data is on.
- About constellation: WebGL canvas hidden and SVG fallback restored under `prefers-reduced-motion` (`custom.css` + `assets/js/about-constellation.js`).
- **Diagram hooks:** `.ds-diagram-hook` / `[data-diagram-hook]` in `10-visual-grammar.css` are static (no autoplay). `[data-animate]` descendants stay un-animated; reduced-motion forces `animation: none`.

## Imagery & Iconography
- **Icons:** PaperMod's built-in social icon set (`themes/PaperMod/assets/`) — the site currently wires up `linkedin` and `github` via `[[params.socialIcons]]` in `hugo.toml`.
- **Logo:** no image logo — the "logo" is text (`Dave Voyles`) with a CSS-injected `~/` prompt prefix (see Components above). No favicon override found in `static/` beyond Hugo/PaperMod defaults.
- **Avatar:** `/images/posts/Dave_Debbie-320.jpeg`, rendered in the sidebar bio card (`.sidebar-avatar`, max 160px, `--radius` rounded corners).
- **Post/content images:** committed directly to `static/images/` (no LFS — see `docs/decisions/0002-images-committed-to-repo.md`), including a large batch of recovered legacy WordPress images (`static/images/www.davevoyles.com_wp-content_uploads_...`), served at `/images/<file>`.
- **Illustration style:** none beyond the generative SVG/WebGL "constellation" graphic on the About page — no custom illustration set.

## Accessibility Notes
- Reduced motion: sitewide floor in `00-tokens.css`; home hero look shows a still frame and pauses off-screen; About constellation likewise; diagram hooks static.
- `:focus-visible` is defined in `00-tokens.css` as a 2px `--ds-accent` outline with 2px offset. A skip-link (`.skip-link` → `#main-content`) sits at the top of `layouts/_default/baseof.html`. Component CSS still has extra accent-tinted `box-shadow` rings on select elements (e.g. `.about-hero-photo`). Hover and `:focus-within` stay paired on list-style components.
- Mint ink (`rgb(232, 241, 234)` on `rgb(10, 15, 12)`) on the dark canvas. Green accent (`rgb(127, 211, 154)`) is used for links and chips; tag-pill contrast on `--ds-tertiary` remains the pair to watch.
- Body copy intentionally stays in the readable system sans font while only structural/meta text goes monospace — a good readability call for long-form posts (rationale in the `custom.css` chrome comment).

## Known Inconsistencies / Design Debt
- **PaperMod aliases remain:** `custom.css` still defines `--theme` / `--entry` / `--accent` / etc. inside a `ds-alias-allow` block so the theme stylesheet keeps working. New CSS should use `--ds-*`.
- **Off-grid spacing leftovers:** exact scale steps (0.25/0.5/0.75/1/1.5rem) were remapped; other rem paddings stay literal so the look does not jump.
- **Component queries still mostly `max-width`:** shells are mobile-first at 1024; About/home grids still use look-preserving `max-width: 640px` / `1024px`.
- **Large single CSS file:** `custom.css` is now sectioned (alias / chrome / widgets / shell / About / home / shared a11y) but not split into partials.
- **Legacy image filenames:** many images under `static/images/` retain WordPress-export names (including stray double extensions).
- **No documented favicon/logo asset:** PaperMod/Hugo defaults plus the CSS-injected `~/` text logo.

## Source Files
- `hugo.toml` — site config, `defaultTheme = "dark"`, `disableThemeToggle = true`, theme selection (`PaperMod`), homepage/menu/social params
- `DESIGN.md` (repo root) — short agent-facing record of this system
- `assets/css/extended/00-tokens.css` — canonical `--ds-*` tokens (canvas/ink + role colors, type, spacing, radius, motion) + mandatory reduce / `:focus-visible` floor
- `assets/css/extended/10-visual-grammar.css` — role labels, patterns, static diagram-hook
- `assets/css/extended/30-home.css`, `assets/css/extended/zz-dark-interactive.css` — homepage ledger and dark interactive surfaces (command palette)
- `assets/css/extended/custom.css` — site override layer (console chrome, layout shell, components) + PaperMod aliases
- `scripts/check-ds-tokens.sh` — CI checker (`make check`); token file is the only place raw colors may live
- `themes/PaperMod/assets/css/core/theme-vars.css` — PaperMod's base CSS custom properties (`--gap`, `--radius`, default light/dark tokens), overridden by the site
- `~/.claude/skills/web-design-standards/SKILL.md` — shared structural standard (token roles, scales, breakpoints, theming, motion, a11y floor)
- `themes/PaperMod/assets/css/core/reset.css` — base reset and default body font stack
- `themes/PaperMod/layouts/baseof.html` — theme's `data-theme` attribute + dark/light toggle wiring
- `layouts/_default/baseof.html` — site's page-shell wrapper (sidebar + content grid) around PaperMod's base layout
- `layouts/index.html` — homepage "Ledger" layout
- `assets/js/home.js`, `assets/js/about-constellation.js`, `assets/js/toc-active.js`, `assets/js/fastsearch.js` — interactive/motion behavior
- `docs/platform-guide.md` — existing prose documentation of the console theme and CSS variable conventions
- `docs/portfolio-surfaces.md` — existing documentation of homepage/About/graph/WebGL surfaces
- `docs/decisions/0002-images-committed-to-repo.md` — image-handling convention
