# Idea-generating playbook

Short workflow for an agent that **proposes** blog posts. Minutes, not a
research project. **Do not write a full post** in this workflow.

Voice and claim rules for when Dave later asks you to draft:
[`authoring-guide.md`](authoring-guide.md),
[`claim-safe-facts.md`](claim-safe-facts.md).

---

## Do this, in order

1. **Open [DaveVoyles/Chat-Agents](https://github.com/DaveVoyles/Chat-Agents).**
   Start at the operations / mission dashboard — what is actually shipped
   and showcased, not every design doc. Verified entry points:
   - [`README.md`](https://github.com/DaveVoyles/Chat-Agents/blob/main/README.md)
     — **Features & lifecycle at a glance** (the showcase of what runs today)
   - [`PRODUCT.md`](https://github.com/DaveVoyles/Chat-Agents/blob/main/PRODUCT.md)
     — ops surfaces (Mission Control is the public home)
   - [`ops-portal/mission/`](https://github.com/DaveVoyles/Chat-Agents/tree/main/ops-portal/mission)
     — Mission Control source (`/mission/` on the ops portal)
   - [`docs/ops-portal-operators.md`](https://github.com/DaveVoyles/Chat-Agents/blob/main/docs/ops-portal-operators.md)
     — how to read that dashboard

   If you cannot open those paths, still start at Chat-Agents: **operations /
   mission dashboard first, then `docs/`**. Do not invent file paths. Do not
   paste secrets, tokens, or auth material.

2. **Then skim Chat-Agents `docs/`** for recent designs and things that are
   starting to get implemented — not the whole archive. Verified start:
   [`docs/design/`](https://github.com/DaveVoyles/Chat-Agents/tree/main/docs/design)
   (numbered plans; newest high numbers first). Use a plan only when the
   README, Mission Control, or an operator doc shows it as shipped or in
   flight. Skip ticket-only spelunking.

3. **Then check this site** so you do not re-pitch the [Agent production
   system](series/agent-production-system.md) series. Read that schedule
   table (slugs + titles) and scan `content/posts/` titles from 2026. Already
   covered: system map, eval gates, human approval, Docker homelab, Xbox
   SLAs → fleets, claim safety, boundaries, GitHub tokens, landing floor
   (scheduled). `landing-floor-without-a-github-app` is future-dated — do
   not treat it as unpublished, and do not change its date.

4. **Hand Dave a pick-list.** Eight to twelve rows. Each row is a **title +
   one-line angle**, grounded in something you actually saw in steps 1–3.
   Claim-safe: no invented metrics, product names, or board columns. If a
   number is not in [`claim-safe-facts.md`](claim-safe-facts.md), leave it
   out of the angle. Prefer “extended and operates” over authorship claims.

5. **Stop.** Do not draft markdown posts, do not add rows to the series
   schedule, and do not create a second ideas tracker / board / backlog
   file. The series table in
   [`series/agent-production-system.md`](series/agent-production-system.md)
   is the only series tracker. Dave picks; a later session writes.

---

## Output shape

```
- Title — one-line angle (what makes it worth writing, tied to a real source)
```

Good: *Mission Control is the home, not a chatbot — what the ops dashboard
actually shows vs. a demo reel.*
Bad: *How I run N agents in production across a 12-column board* (invented
count + invented columns).
