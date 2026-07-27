# 0006 — Post-to-video pipeline: promote, modularize, publish to YouTube

**Status:** Approved 2026-07-27 — ready for execution
**Author:** Claude Code (planner session, 2026-07-27)
**Approval channel:** Lavish review form. Per `AGENTS.md` §Safety, a Lavish form
approval authorizes the plan's *reversible* scope but **not** its ⚠️ irreversible
steps — the orchestrator must obtain an in-chat go-ahead from Dave before executing
D6 or D7.
**Supersedes scope of:** [0005 — post-to-video throwaway prototype](0005-post-video-prototype.md)
**Prototype source of truth:** branch `prototype/post-video-pipeline` (untouched by this plan, retained as primary-source record)

---

## Problem Statement

Plan 0005 proved a 60-second explainer video can be generated from a blog post
entirely on local hardware — deterministic renders, no API spend, ~24 seconds of
build time. It ended as a throwaway spike: the code lives on a prototype branch,
the narration is hand-written, the output is staged into a draft page that never
publishes, and nothing about it is discoverable to a future session.

Three gaps stand between that spike and something Dave or an agent can actually
use next month:

1. **No home.** The code is on a branch that is never merged, in a directory
   named `video-prototype`, with no entry point beyond a bespoke build script.
   Nothing in the repo's documented surface mentions it exists.
2. **No hosting story.** The spike self-hosted the MP4 from the site's static
   directory. That is not viable at scale: the deploy target is GitHub Pages,
   which caps files at 100 MB, softly caps the site at 1 GB, and whose terms
   discourage media hosting outright. The repo has never tracked a video file;
   its largest tracked asset today is a 4.6 MB PNG.
3. **No safety gate on what the video says.** This site has a real claim-safety
   regime — a content gate hard-fails the build on forbidden authorship claims,
   and a claim-safe facts page is the declared single source of truth. Narration
   is public, spoken, first-person content in exactly that risk class, and it is
   entirely ungated today because the gate only scans markdown.

This plan closes all three, switches the narration voice to the British `bm_lewis`
Dave selected, and proves the upload path against a real API call rather than
shipping it untested.

## Decisions carried from grilling

Resolved in the 2026-07-27 grilling session; recorded here so execution does not
re-open them.

| # | Decision |
|---|---|
| 1 | **Hosting is YouTube.** The API uploads as *private* and stops; Dave flips to unlisted/public in YouTube Studio. This is a deliberate gate, not an unfinished feature — see ADR 0011. |
| 2 | **Narration is agent-drafted, human-approved.** An agent drafts from the post constrained to the claim-safe facts page, then stops for Dave's approval on the *text* before any render happens. |
| 3 | **Staged invocation.** Three independently re-runnable Make targets rather than one end-to-end command, so a narration tweak does not force a re-upload. |
| 4 | **Credentials live outside the repo.** This repo is public and its ignore file has no environment-file entry today. |
| 5 | **One guide, split by audience.** A single end-to-end doc with a Dave-facing quickstart and an agent-facing contract section. |
| 6 | **Embed via Hugo's built-in youtube shortcode.** Already verified working and already documented on the platform guide — no custom shortcode, no theme override. |
| 7 | **Voice is `bm_lewis`** (British male), which also requires switching the TTS pipeline's language code. |
| 8 | **No live publish this round.** One real upload to *private* as a verification probe; the live post is untouched. |

## Deliverables

| # | Deliverable | Size | Acceptance Criteria | Dependencies | Status |
|---|---|---|---|---|---|
| D1 | Promote pipeline to `tools/video/` with staged Make targets | M | Code from `prototype/post-video-pipeline` lands at `tools/video/`. `make help` lists `video-draft`, `video-render`, `video-upload`. `make video-render SCENES=…` regenerates the existing 8-scene cut and `ffprobe` reports the same duration/resolution as the prototype's output. Variables are `POST=` / `SCENES=` — **never `PATH=`**, which Make reserves for the shell search path. | — | Todo |
| D2 | Voice switch to `bm_lewis` + wire the dead `voice` key | XS | TTS language code is **derived from the voice name's first character** rather than hardcoded, so a `bm_`/`bf_` voice selects British automatically and an `am_`/`af_` voice selects American — this is what makes the switch safe rather than a second thing to remember. The `voice` key in the scenes file demonstrably drives the renderer (proven by differing decoded-audio hashes across two renders), where today it is read by nothing. **Precedence is explicit and documented: the scenes file's `voice` key wins over the code default; the carried-over scenes file is updated to `bm_lewis` in this deliverable** so no file silently renders in the old American voice. | D1 | Todo |
| D3 | Secret hygiene: ignore-file entry, credential-location pointer, gitleaks scan | XS | `.env` is git-ignored. Any example env file is a **pointer to the out-of-repo credential path only** — it must not imply that in-repo credential storage is a supported alternative, since that is the option grilling explicitly rejected for a public repo. The gitleaks pre-commit scan is enabled via the Chat-Agents scaffold script and rejects a deliberately-planted fake credential in a test commit. | — | Todo |
| D4 | Claim-safety gate for on-screen and spoken text | S | The content-gate script scans the scenes file's narration strings **and its headline/on-screen card text** with the same forbidden-claim patterns it already applies to markdown — both are public first-person claims, and headlines are arguably more scrutinized since they persist on screen. A paired test under `scripts/tests/` proves it: a scenes fixture carrying a known-forbidden authorship claim fails the gate in narration *and* in a headline; a clean one passes. Wired into the existing `make check` target and CI. | D1 | Todo |
| D5 | `video-draft` stage — post to scenes file | M | `make video-draft POST=<slug>` produces a schema-valid scenes file from the post's markdown, constrained to the claim-safe facts page, and **stops** — printing the narration for approval rather than proceeding to render. Output passes the existing scenes validator and the D4 gate. | D1, D4 | Todo |
| D6 | Google Cloud project + OAuth credential setup | S | 🙋 **Dave-gated.** A Google Cloud project with the YouTube Data API enabled and a Desktop-app OAuth client exists. **The OAuth scope is least-privilege — upload-only, never the broad channel-management scope**, so a leaked or misused refresh token cannot delete or alter existing channel content. Dave downloads the client-secret JSON and drops it at an agreed path; the agent moves it to `~/.config/davevoyles-video/credentials.json` at mode 0600 and deletes the source, per the human-to-agent secret handoff convention. A read-back call confirms the token authenticates. **Scheduled early deliberately** — an external-credential blocker caught here costs one step; caught at D7 it invalidates everything upstream. | D3 | Todo |
| D7 | `video-upload` stage + live verification probe | M | `make video-upload MP4=…` uploads via the YouTube Data API and prints the returned video ID. Verified by **one real upload to private visibility** — verbatim API response captured, the video visible in YouTube Studio, then deleted. Handles the resumable-upload path and surfaces quota/auth errors explicitly rather than failing silently. **Raw token values are never printed, logged, or included in error output** — inspect length/prefix only, per AGENTS.md. The daily upload ceiling imposed by API quota is documented so a future batch backfill fails loudly rather than silently partway. | D1, D6 | Todo |
| D8 | Hugo privacy-enhanced YouTube embeds | XS | Hugo's YouTube privacy setting is enabled so embeds serve from the no-cookie domain. Proven by building a page with the shortcode and grepping the built HTML for the no-cookie host. | — | Todo |
| D9 | ADRs 0011 and 0012 | XS | ADR 0011 records YouTube-with-a-manual-publish-gate, quoting Google's restriction verbatim so a future agent does not try to "finish" the automation. ADR 0012 records narration as claim-safety-gated content. Both in MADR 4.0.0 format, cross-referenced from this plan. | — | Todo |
| D10 | `docs/video-guide.md` + cross-links | S | One guide with a "Quickstart (Dave)" section — three commands, one worked example, one suggested first action — and an "Agent contract" section covering the scenes schema, claim-safety rules, stage boundaries, and known failure modes. Cross-linked from the platform guide's existing §Video section and the authoring guide. Documents `TARGET_LUFS` as a knob and notes YouTube normalizes to roughly −14 LUFS. | D1, D2, D5, D7 | Todo |
| D11 | Full `bm_lewis` re-render delivered to Dave | XS | The existing agent-production-system narration re-rendered end-to-end in the British voice, delivered to Dave in chat as an MP4 for his verdict. Loudness probed and reported. Two consecutive cold builds produce identical checksums, confirming the seeding fix survives the voice change. | D2 | Todo |

All deliverables are XS–M; none require decomposition before implementation.

**Scheduling note — D6 is a human gate mid-chain.** D6 needs Dave at a browser
(Google Cloud console) and blocks D7, which in turn blocks D10. If Dave is
unavailable, the orchestrator must **park D6/D7/D10 and complete everything else**
(D1–D5, D8, D9, D11 are all reachable without him) rather than idling on the
frontier. Raise the 🙋 once and keep working.

## Testing Decisions

Plan 0005 waived TDD as a throwaway spike. **That waiver does not carry forward** —
this plan produces tooling that other sessions will depend on. Seams under test,
agreed here so the loop never stops to ask:

| Deliverable | Seam | Technique |
|---|---|---|
| D4 | The narration gate | **True TDD.** Paired test under `scripts/tests/` written red first: a scenes fixture carrying a known-forbidden claim must fail the gate before the gate is implemented. This is the one deliverable with clean, deterministic, security-relevant logic — it earns a real red-green cycle. |
| D1, D2, D11 | Render output | **Mechanical acceptance probes, not unit tests.** `ffprobe` for duration/resolution/stream layout; decoded-stream hashing compared *separately from container bytes* to isolate audio changes from video; a loudness measurement pass. A contact sheet tiling the whole video into one image catches per-frame defects that reviewing scenes individually misses. |
| D5 | Draft stage | Schema validation via the existing scenes validator, plus the D4 gate. The drafting itself is judgment-shaped and is not unit-testable; the human approval gate is the real control. |
| D7 | Upload stage | **One live private upload** is the test — OAuth, resumable transfer, and ID capture cannot be meaningfully mocked into confidence. Failure paths (expired token, quota exhaustion) verified by deliberately inducing them where cheap. |
| D3 | Secret scan | Plant a fake credential in a scratch commit, confirm the hook rejects it, discard the commit. |

**Verification standard:** verbatim command output, no paraphrase. Any claim that
a render "works" must cite an actual probe result. This plan's parent spike
produced four separate silent failures that all exited zero — exit codes are not
evidence here.

## ⚠️ Irreversible Steps

🙋 **These are NOT yet authorized.** The plan was approved via a Lavish review form,
which per `AGENTS.md` §Safety authorizes reversible in-plan scope only — the harness
cannot verify browser-form consent for gate-sensitive actions. **The orchestrator must
get an explicit in-chat go-ahead from Dave before running D6 or D7.** Every other
deliverable is unblocked and should proceed without re-asking.

1. **A real video is uploaded to Dave's YouTube account** (D7). Private visibility,
   deleted immediately after the probe. Reversible by deletion, but it is a genuine
   write to an external service under Dave's identity, so it is listed rather than
   assumed.
2. **A Google Cloud project is created** under Dave's Google account (D6), and the
   YouTube Data API is enabled on it. Deletable, but it is external account state
   this repo cannot revert.
3. **The downloaded client-secret file is deleted** from wherever Dave drops it (D6),
   after being moved to the 0600 location. Deliberate, per the secret-handoff
   convention — but it is a deletion of a file the agent did not create, and
   re-downloading requires a trip back to the Google Cloud console.

Nothing in this plan publishes to davevoyles.com, modifies a live post, or changes
anything a site visitor can see.

## Out of Scope

- **Publishing any video to a live post.** D11 delivers an MP4 for Dave's verdict;
  the shortcode landing in a real post is a follow-up he triggers.
- **Pursuing Google's compliance audit** to lift the private-upload restriction.
  Explicitly rejected in grilling — the manual flip is the accepted design.
- **A `/videos` index page or front-matter video metadata.** The embed is a body
  shortcode; making videos queryable is a later increment if ever wanted.
- **Non-English voices.** 54 Kokoro voices exist across nine languages; only the
  British switch is in scope, and other languages need their own dependencies.
- **Modifying the `prototype/post-video-pipeline` branch.** It stays as the
  primary-source record.
- **A Claude Code skill wrapping the pipeline.** Considered in grilling, deferred —
  the guide plus discoverable Make targets is the agreed surface.

## Related

- ADR 0011 — Video hosting is YouTube with a manual publish gate *(this plan, D9)*
- ADR 0012 — Narration is claim-safety-gated content *(this plan, D9)*
- Plan [0005](0005-post-video-prototype.md) — the originating prototype

## Execution Tracking

*(Populated by the plan-to-issues export.)*
