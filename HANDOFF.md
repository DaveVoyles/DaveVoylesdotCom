# Handoff

**2026-07-24 portfolio surfaces session closed with docs.** Site UX work is
on `main` and documented for the next agent.

## What shipped (this initiative)

| Work | PR / commit | Notes |
|------|-------------|--------|
| About portfolio layout | [#86](https://github.com/DaveVoyles/DaveVoylesdotCom/pull/86) | Data-driven `content/about.md`, console styling |
| About WebGL constellation | [#87](https://github.com/DaveVoyles/DaveVoylesdotCom/pull/87) | Three.js + SVG fallback, cluster highlight |
| Home dashboard + magazine | [#88](https://github.com/DaveVoyles/DaveVoylesdotCom/pull/88) | No full archive dump; WebGL hero field |
| Projects grid | [#89](https://github.com/DaveVoyles/DaveVoylesdotCom/pull/89) | Resume Builder, Philly Lax Viz, CFB 26 Playbooks, Harriton (head coach) |
| Agent docs | (this commit) | `docs/portfolio-surfaces.md`, ADR 0010, README/platform/CONTEXT/learnings |

## Where to start next session

1. Read **`docs/portfolio-surfaces.md`** before any home/About/WebGL change.  
2. `git submodule update --init --recursive` if `themes/PaperMod` is empty.  
3. Preview: `hugo server -D` → `/`, `/about/`, `/archives/`.

## Current live intent

- **Home:** dashboard — featured, projects, short recent, archive CTA.  
- **About:** former Xbox/Microsoft TPM; agents-first skills; constellation =
  *agent production system*, not a résumé timeline.  
- **Claims:** keep aligned with resume-builder candidate-profile / accuracy docs.  
- **No Terraform/K8s** as skill claims; Azure + Docker yes.

## Open / not blocking

- Graph page UX follow-ups still under broader [#24](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/24) umbrella if still open.  
- Content gap 2015–2024 if still tracked ([#55](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/55)).  
- Optional later: filter Recent by year; richer WebGL packet-flow; dedicated headshot crop if Dave_Debbie crop is awkward.

## Shipped after portfolio docs (2026-07-24 polish)

- About: headshot + looking-for / currently building; constellation **node detail panel**; `?cluster=` / `?node=` deep links; keys 1–4 + Esc.  
- Home: **Currently building** strip (`params.home.building`).  
- Case study post: `/posts/agent-production-system/` (claim-safe; feeds Featured).

## Nothing currently in-flight

Portfolio UX + docs handoff complete. Next session can start clean.
