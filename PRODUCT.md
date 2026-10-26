# Product

<!-- impeccable:product-schema 1 -->

Interview skipped (owner approved). Every inferred fact is labelled `Assumption:`; facts quoted from the repo carry a path.

## Platform

web

## Users
- Readers of the blog: engineers, program managers, and game developers who want notes from real systems. Assumption: arriving from search, social links, or a resume/LinkedIn click.
- Hiring managers and collaborators checking the portfolio (About, projects grid). Assumption: they skim, then verify claims.
- Authors of the site: Dave and coding agents who publish posts through the pipeline in `docs/post-pipeline.md`.

## Product Purpose
davevoyles.com is Dave Voyles' personal site: a blog plus a portfolio, built from Markdown into static HTML (`README.md`). The site description reads "Dave Voyles writes about AI, agents, cloud and games: notes from building and running real systems" (`hugo.toml`). Success: a reader trusts the posts and can see the work behind them. Assumption: success is not measured by traffic targets; none are documented.

## Positioning
A builder-first site where the author runs the systems he writes about (agent production systems with real controls, not demo chatbots), per `docs/claim-safe-facts.md`. A generic TPM blog could not truthfully copy that.

## Operating Context
- Hugo static site, PaperMod theme as a git submodule, deployed to GitHub Pages with a daily CI rebuild that publishes future-dated posts (`AGENTS.md`).
- Posts follow a pipeline: idea, draft, content gate (`make check`), publish (`docs/post-pipeline.md`).
- Home is a dashboard (hero, featured post, projects grid, short recent list), not a full archive (`docs/decisions/0010-home-dashboard-not-full-archive.md`).

## Capabilities and Constraints
- Static output only; no server, no login.
- About is driven by `[about]` front matter in `content/about.md`, not the Markdown body.
- Topics are a controlled vocabulary of 6 buckets; tags reuse existing values (`docs/claim-safe-facts.md`, `CONTEXT.md`).
- Do not edit `themes/PaperMod/`; overrides live in `layouts/` and `assets/`.
- Terms: "Console theme" (the dark-only visual system), "Constellation" (About-page agent map), "Vault" (short wikilinked notes), see `CONTEXT.md`.

## Brand Commitments
- Name: Dave Voyles. Text logo with a CSS `~/` prompt prefix; no image logo (`docs/DESIGN.md`).
- Claim safety is binding: only metrics and authorship language in `docs/claim-safe-facts.md`. Dave is a **former** Xbox / Microsoft Senior TPM (past tense). Say "extended and operates" for OpenClaw / Hermes / firstmate, never "built". No Terraform or Kubernetes as skill claims.
- Voice: plain, first-person, practical. Assumption: inferred from the posts and `docs/authoring-guide.md`.

## Evidence on Hand
- Blog posts in `content/`, recovered legacy WordPress images in `static/images/`.
- Allowed public metrics: 10+ years at Microsoft, ~$50M annual revenue (Xbox 360 commerce retirement), 12h to 30m publish SLA, 20+ Docker containers (`docs/claim-safe-facts.md`).
- Absent: testimonials, customer logos, traffic numbers, pricing. Do not fabricate any.

## Product Principles
1. Claims come from `docs/claim-safe-facts.md` or not at all.
2. Content first: reading comfort beats decoration; body copy stays a readable sans.
3. One dark theme (`defaultTheme = "dark"`, toggle disabled); no light mode.
4. The site is static and fast; motion and WebGL are small, deliberate, and degrade under reduced motion and Save-Data.
5. A human or an agent publishes through the same gate.

## Accessibility & Inclusion
- Respect `prefers-reduced-motion` (sitewide floor in `assets/css/extended/00-tokens.css`); keep the skip link and visible `:focus-visible` outline (`docs/DESIGN.md`).
- Assumption: target is WCAG AA; the repo checks contrast informally, no formal standard is stated.
