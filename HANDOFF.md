# Handoff

**2026-11-08 — Sidebar bio fix on `fix/sidebar-bio`.** `layouts/partials/sidebar.html` now renders `homeInfoParams.Content` (was title-only). New bio text in `hugo.toml` (Comcast/Microsoft/Xbox → Salesforce evangelist + lacrosse + writing). `make check` PASSED, `make build` 481 pages.

## Live

https://davevoyles.com/ (after PR merges + GitHub Pages rebuild)

## Do not

- Do not change `date` / `draft` on any post for art/layout nits.
- Do not put private hosts / Tailscale / creds in the post.
- Do not reuse cover as a body image.
