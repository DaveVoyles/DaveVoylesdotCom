# Design System — davevoyles.com

> Snapshot of this site's **current** design as implemented, documented so a designer or agent can understand the visual system without reading source. Generated 2026-08-14 as part of a cross-site design inventory; source of truth is always the files listed in §Source Files.

## At a Glance
| | |
|---|---|
| Live URL | https://davevoyles.com |
| Stack / framework | Hugo static site generator, theme [PaperMod](https://github.com/adityatelange/hugo-PaperMod) (git submodule under `themes/PaperMod/`) |
| Styling approach | CSS custom properties. Theme ships base tokens in `themes/PaperMod/assets/css/core/theme-vars.css`; the site overrides/extends them in `assets/css/extended/custom.css`, which Hugo Pipes loads after the theme's own CSS |
| Theme modes | Both light and dark, toggled via `data-theme="light"` / `data-theme="dark"` on `<html>` (PaperMod's built-in toggle button + `localStorage`, `themes/PaperMod/layouts/baseof.html`) |
| Overall vibe | A "console" theme layered on PaperMod's clean blog chrome: warm off-white/near-black backgrounds, a single green accent, and monospace type used deliberately for structural/meta text (nav, titles, post meta, TOC) so the site reads like a terminal/directory listing, while body copy stays a readable system sans-serif |

## Color Palette
Real values from code — never approximate. The site redefines PaperMod's base tokens; PaperMod's own defaults are shown for reference but are overridden and not what renders.

### Light mode ("day console")
| Token / usage | Hex / RGB | Where defined | Notes |
|---|---|---|---|
| Background (`--theme`) | `rgb(250, 249, 244)` → `#faf9f4` | `assets/css/extended/custom.css:11` | Warm off-white, not pure white |
| Surface / card (`--entry`) | `rgb(255, 255, 255)` → `#ffffff` | `assets/css/extended/custom.css:12` | Cards, sidebar bio, TOC panel |
| Text primary (`--primary`) | `rgb(24, 26, 22)` → `#181a16` | `assets/css/extended/custom.css:13` | Near-black, slight green cast |
| Text secondary (`--secondary`) | `rgb(90, 95, 83)` → `#5a5f53` | `assets/css/extended/custom.css:14` | Meta text, labels |
| Tertiary (`--tertiary`) | `rgb(210, 224, 200)` → `#d2e0c8` | `assets/css/extended/custom.css:15` | Tag pill background |
| Content text (`--content`) | `rgb(32, 35, 28)` → `#20231c` | `assets/css/extended/custom.css:16` | Body copy color |
| Code block bg (`--code-block-bg`) | `rgb(24, 26, 22)` → `#181a16` | `assets/css/extended/custom.css:17` | Fenced code blocks stay dark even in light mode |
| Inline code bg (`--code-bg`) | `rgb(234, 238, 226)` → `#eaeee2` | `assets/css/extended/custom.css:18` | |
| Border (`--border`) | `rgb(214, 220, 202)` → `#d6dcca` | `assets/css/extended/custom.css:19` | |
| Accent (`--accent`) | `rgb(34, 99, 60)` → `#22633c` | `assets/css/extended/custom.css:20` | Green; links, active states, focus rings |

### Dark mode ("night console")
| Token / usage | Hex / RGB | Where defined | Notes |
|---|---|---|---|
| Background (`--theme`) | `rgb(13, 15, 13)` → `#0d0f0d` | `assets/css/extended/custom.css:26` | |
| Surface / card (`--entry`) | `rgb(18, 22, 17)` → `#121611` | `assets/css/extended/custom.css:27` | |
| Text primary (`--primary`) | `rgb(239, 236, 224)` → `#efece0` | `assets/css/extended/custom.css:28` | |
| Text secondary (`--secondary`) | `rgb(138, 143, 125)` → `#8a8f7d` | `assets/css/extended/custom.css:29` | |
| Tertiary (`--tertiary`) | `rgb(38, 48, 38)` → `#263026` | `assets/css/extended/custom.css:30` | |
| Content text (`--content`) | `rgb(195, 192, 179)` → `#c3c0b3` | `assets/css/extended/custom.css:31` | |
| Code block bg (`--code-block-bg`) | `rgb(18, 22, 17)` → `#121611` | `assets/css/extended/custom.css:32` | |
| Inline code bg (`--code-bg`) | `rgb(26, 32, 24)` → `#1a2018` | `assets/css/extended/custom.css:33` | |
| Border (`--border`) | `rgb(38, 48, 38)` → `#263026` | `assets/css/extended/custom.css:34` | |
| Accent (`--accent`) | `rgb(95, 184, 122)` → `#5fb87a` | `assets/css/extended/custom.css:35` | Brighter green for dark backgrounds |

PaperMod's own unthemed defaults (not used, shown for contrast) live in `themes/PaperMod/assets/css/core/theme-vars.css` — light `--theme: rgb(255,255,255)`, `--primary: rgb(30,30,30)`; dark `--theme: rgb(29,30,32)`, `--primary: rgb(218,218,219)`. The site's palette fully replaces these.

## Typography
| Role | Family | Size / scale | Weight | Where defined |
|---|---|---|---|---|
| Body copy | System sans stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif` | Browser default (~16px base), theme default line-height | Regular | `themes/PaperMod/assets/css/core/reset.css:27` (inherited, not overridden) |
| Structural / meta (logo, nav, post titles, post meta, breadcrumbs, archive headers, TOC, search results) | Monospace stack: `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace` | Varies by element (e.g. TOC entries `0.82rem`, TOC summary `0.72rem` uppercase w/ `0.06em` tracking) | 400–600 | `assets/css/extended/custom.css:38-54` (selector list applying mono font to `.logo a`, `.menu a`, `.post-title`, `.entry-header h2`, `.post-meta`, `.entry-footer`, `.terms-tags a`, `.breadcrumbs`, `.page-header h1`, archive/search classes, `.related-posts-title`) |
| Series/TOC labels | Same monospace stack | `0.8rem`–`0.85rem` | 400 | `assets/css/extended/custom.css:138-144` |

Type scale is not formalized into a documented rem-based system — sizes are set ad hoc per component in rem (`0.72rem`–`1.1rem` range observed) rather than drawn from a shared scale. No custom `@font-face` / web fonts are loaded; everything is a system font stack for performance.

## Spacing & Layout
- **Grid / container:** PaperMod's base `--gap: 24px` (`themes/PaperMod/assets/css/core/theme-vars.css:2`). The site widens the content column with its own tokens (`assets/css/extended/custom.css:229-234`):
  - `--main-width: 900px`
  - `--nav-width: 1440px`
  - `--sidebar-width: 240px`
  - `--toc-rail-width: 280px`
  - `.main` and `.footer` max-width = `main-width + sidebar-width + toc-rail-width + gap*4`
- **Page shell:** every page renders in a persistent two-column CSS grid (`.page-shell`: `sidebar-width` + `minmax(0,1fr)`) — a sticky bio sidebar plus content, defined in `assets/css/extended/custom.css:236-260` and applied via `layouts/_default/baseof.html`.
- **Post shell:** post pages use a further grid (`.post-shell`: `minmax(0,1fr) toc-rail-width`) putting a sticky TOC rail beside the article (`assets/css/extended/custom.css:302-320`).
- **Breakpoints:** single collapse point at `max-width: 1024px` where both the sidebar and TOC rail stack to a single column (`assets/css/extended/custom.css:295`, `:431`). Secondary narrower breakpoints appear ad hoc per component: `800px`, `720px`, `700px`, `520px` (e.g. `assets/css/extended/custom.css:668`, `:783`, `:981`, `:1083`, `:1575`).
- **Spacing scale:** not a formal 4px/8px system — spacing is a mix of the `--gap` token (24px, and derived `calc()` multiples like `--gap * 1.5`, `--gap * 2`) and hand-picked rem values (`0.25rem`, `0.4rem`, `0.5rem`, `0.75rem`, etc.) inside components.
- **Border radius:** single shared token `--radius: 8px` (`themes/PaperMod/assets/css/core/theme-vars.css:8`), used throughout for cards, panels, and buttons. Fully round elements (avatars, pills/badges) use `border-radius: 50%` or `999px` directly rather than the token.
- **Shadow / elevation:** minimal and accent-tinted, not a neutral drop-shadow system — e.g. `box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 6%, transparent)` on the TOC panel (`assets/css/extended/custom.css:347`), and a focus-ring-style shadow on the avatar (`assets/css/extended/custom.css:568`). No large soft shadows/elevation levels anywhere.

## Components
- **Nav / logo:** `.logo a::before` injects a literal `~/` prompt prefix in accent color before the site title — a deliberate terminal-prompt affectation (`assets/css/extended/custom.css:59-64`).
- **Post list / archive entries:** `.post-entry`, `.archive-entry` get a 2px transparent left rule that lights up in `--accent` on hover/focus — the site's recurring "directory listing" hover pattern, reused identically for Related Posts and Backlinks lists (`assets/css/extended/custom.css:88-100`, `:170-178`, `:459-467`).
- **Tag pills:** background `--tertiary`, text `--accent`, 1px `--border` border (`assets/css/extended/custom.css:79-83`).
- **Sidebar bio card:** persistent left rail, `1px solid var(--border)` panel with `--radius`, avatar image, title, bio content, social icons (`assets/css/extended/custom.css:249-283`); collapses to a stacked card below 1024px.
- **Post TOC rail:** sticky right-hand panel styled as a distinct bordered "side panel" (uppercase monospace header, active-link highlight driven by `assets/js/toc-active.js` via IntersectionObserver) — permanently expanded on desktop (≥1025px), click-to-expand `<details>` on narrower viewports (`assets/css/extended/custom.css:339-435`).
- **Series nav / Related Posts / Backlinks:** three near-identical bottom-of-post widgets sharing the border-top + left-rule-hover-list pattern (`assets/css/extended/custom.css:105-207`, `:459-497`).
- **Buttons/pills (general):** repeated pattern of `border-radius: 999px` pill buttons with a fast `border-color/color/background` transition (~0.15s ease), seen at multiple points in the file (e.g. `assets/css/extended/custom.css:700-707`, `:1102-1108`).
- **Homepage-specific widgets** (not itemized individually here — see `docs/portfolio-surfaces.md`): featured/recent post cards, "currently building" strip, projects grid, topic rails, and a WebGL hero, all driven by `hugo.toml`'s `[params.home]` block and `layouts/index.html`.
- **About page:** interactive "agent constellation" graphic (`assets/js/about-constellation.js`) with an SVG fallback and WebGL variant, hidden under `prefers-reduced-motion`.

## Motion & Interaction
- Not a static site — several small, deliberate interactive/animated surfaces exist:
  - Homepage WebGL hero (`assets/js/home-hero-webgl.js`).
  - About-page "agent constellation" (`assets/js/about-constellation.js`), SVG + WebGL variants with per-element `transition` on stroke/fill/opacity/radius (e.g. `assets/css/extended/custom.css:818-853`).
  - Live TOC active-section highlighting via IntersectionObserver (`assets/js/toc-active.js`).
  - Instant client-side search (`assets/js/fastsearch.js`, PaperMod's fuse.js-based search).
- Most interactive-state transitions are short and consistent: `0.15s ease` / `0.18s ease` on color, border-color, background, opacity, and occasionally `transform` — no long or bouncy easing anywhere observed.
- `@media (prefers-reduced-motion: reduce)` is explicitly honored for the About constellation: the WebGL canvas is hidden and the SVG fallback reverts to normal static layout (`assets/css/extended/custom.css:1323-1335`).

## Imagery & Iconography
- **Icons:** PaperMod's built-in social icon set (`themes/PaperMod/assets/`) — the site currently wires up `linkedin` and `github` via `[[params.socialIcons]]` in `hugo.toml`.
- **Logo:** no image logo — the "logo" is text (`Dave Voyles`) with a CSS-injected `~/` prompt prefix (see Components above). No favicon override found in `static/` beyond Hugo/PaperMod defaults.
- **Avatar:** `/images/posts/Dave_Debbie.jpeg`, rendered in the sidebar bio card, circular via CSS.
- **Post/content images:** committed directly to `static/images/` (no LFS — see `docs/decisions/0002-images-committed-to-repo.md`), including a large batch of recovered legacy WordPress images (`static/images/www.davevoyles.com_wp-content_uploads_...`), served at `/images/<file>`.
- **Illustration style:** none beyond the generative SVG/WebGL "constellation" graphic on the About page — no custom illustration set.

## Accessibility Notes
- Reduced motion is explicitly handled for the About-page constellation (see Motion & Interaction) — no equivalent `prefers-reduced-motion` guard was found for the homepage WebGL hero in `custom.css`.
- Focus states rely mostly on the browser/theme default plus the accent-tinted `box-shadow` ring pattern on select elements (e.g. avatar `assets/css/extended/custom.css:568`) rather than a single, sitewide `:focus-visible` treatment; hover and `:focus-within` are paired consistently on list-style components (post entries, related posts, backlinks), which is a good pattern for keyboard users.
- Color contrast was not measured numerically in this pass, but the palette is high-contrast by construction (near-black text on off-white in light mode, light text on near-black in dark mode); the green accent (`#22633c` light / `#5fb87a` dark) is used for both text and interactive affordances, which is worth a contrast check if it's ever used for small text on the tertiary tag-pill background.
- Body copy intentionally stays in the readable system sans font while only structural/meta text goes monospace — a good readability call for long-form posts (documented rationale in the CSS comment at `assets/css/extended/custom.css:36-38`).

## Known Inconsistencies / Design Debt
- **No formal type scale:** font sizes for non-body text are hand-picked per component (`0.72rem`, `0.75rem`, `0.8rem`, `0.82rem`, `0.85rem`, `0.9rem`, `0.95rem`, `1rem`, `1.1rem`, ...) rather than drawn from a documented scale — makes it easy to introduce a slightly-off size for a new component.
- **No formal spacing scale:** beyond the single `--gap` token, spacing values are ad hoc rem numbers chosen per component rather than a 4px/8px-based system.
- **Breakpoints are ad hoc, not a shared list:** `1024px`, `900px`, `800px`, `720px`, `700px`, `520px` all appear as one-off `@media` queries scattered through `custom.css` rather than named/shared breakpoint tokens.
- **Border radius mostly consistent but not universal:** `--radius` (8px) is used broadly, but several components hardcode `999px` (pills) or `50%` (avatars) directly instead of deriving from a documented radius scale — reasonable in isolation, but not centrally documented.
- **Large single CSS file:** `assets/css/extended/custom.css` is 2078 lines covering console theming, page shell, TOC, series nav, related posts, backlinks, homepage widgets, and About constellation styling all in one file with no internal sectioning beyond comments — harder to navigate than split partials would be.
- **Legacy image filenames:** many images under `static/images/` retain their original WordPress-export filenames (e.g. `www.davevoyles.com_wp-content_uploads_2014_09_podcast-logo.jpg.jpg`, including a stray double extension), which is functional but not a clean naming convention.
- **No documented favicon/logo asset:** the site relies on PaperMod/Hugo defaults for favicon-equivalent branding; no dedicated brand-mark file was found alongside the CSS-injected `~/` text logo.
- **Homepage WebGL hero has no confirmed reduced-motion guard** in `custom.css`, unlike the About-page constellation which explicitly disables its WebGL canvas under `prefers-reduced-motion: reduce`.

## Source Files
- `hugo.toml` — site config, theme selection (`PaperMod`), homepage/menu/social params
- `assets/css/extended/custom.css` — site's full design override layer (colors, typography selectors, layout shell, components, motion) — the primary source of truth
- `themes/PaperMod/assets/css/core/theme-vars.css` — PaperMod's base CSS custom properties (`--gap`, `--radius`, default light/dark tokens), overridden by the site
- `themes/PaperMod/assets/css/core/reset.css` — base reset and default body font stack
- `themes/PaperMod/layouts/baseof.html` — theme's `data-theme` attribute + dark/light toggle wiring
- `layouts/_default/baseof.html` — site's page-shell wrapper (sidebar + content grid) around PaperMod's base layout
- `layouts/index.html` — homepage dashboard/magazine layout
- `assets/js/home-hero-webgl.js`, `assets/js/about-constellation.js`, `assets/js/toc-active.js`, `assets/js/fastsearch.js` — interactive/motion behavior
- `docs/platform-guide.md` — existing prose documentation of the console theme and CSS variable conventions
- `docs/portfolio-surfaces.md` — existing documentation of homepage/About/graph/WebGL surfaces
- `docs/decisions/0002-images-committed-to-repo.md` — image-handling convention
