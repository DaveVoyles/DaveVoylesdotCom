# Handoff

**Plans 0001-0004 fully complete and live.** This session (2026-07-21) was two small reported-issue fixes, not a new plan.

## What shipped this session

- **PR #83** — fixed `/search/` being unclickable/un-typeable. Root cause: PaperMod's vendored `fastsearch.js` only cleared the search `<input>`'s `disabled` attribute inside a `window` `load` listener, which waits for every subresource on the page, not just the DOM — early keystrokes were silently dropped. Fixed via a site-level override (`assets/js/fastsearch.js` shadows the pinned `themes/PaperMod` submodule via Hugo's asset lookup) that calls init immediately instead, since the script already runs with `defer`. Landed through the full review-lenses → `land-pr.sh` path; both soft lenses independently flagged a missing fork-provenance comment, fixed before merge. CI watched green, confirmed working live on davevoyles.com post-deploy.
- **PR #84** — removed "Principal" from the sidebar bio text, and wired up the sidebar avatar photo. `layouts/partials/sidebar.html` (plan 0004) already supported an optional `homeInfoParams.Avatar` image path that had never been set — just needed the config value. Dave uploaded the source photo (himself and his wife, at Kerið crater in Iceland) directly to `static/images/posts/Dave_Debbie.jpeg` via the GitHub web UI after this sandbox couldn't reach either of his Macs' local filesystems or his OneDrive share link; replaced the 3.5MB 4032x3024 original in place with a center-cropped 480x480 (82KB) version. review-lenses caught a real gap (alt text hardcoded to the site author's name despite showing two people) — added an optional `homeInfoParams.AvatarAlt` alongside the fix, also correcting a now-stale template comment. Landed same way as #83; CI watched green, confirmed live.

## Current live state (davevoyles.com)

- 77 posts + 4 vault notes, unchanged this session. `/search/` accepts input immediately on page load; the sidebar bio (every page) shows the "Formerly a Software Engineer..." text (no "Principal") plus a photo, both alt-texted correctly.
- `themes/PaperMod` git submodule needs `git submodule update --init --recursive` in any fresh worktree — still uninitialized by default (pre-existing, unrelated to this session).
- **This sandbox has no access to the user's actual local filesystem, on either of his Macs** — paths like `/Users/davevoyles/Downloads/...` or `/Volumes/<other-mac>/...` that look valid resolve to an empty/different directory here. OneDrive personal-share links (`1drv.ms`) are also unreachable both via `curl` (Microsoft's WAF returns "The request is blocked") and via `WebFetch` (redirects into a JS-rendered SPA `WebFetch` can't execute; the actual image loads client-side as a `blob:` URL that the Chrome extension's JS-eval tool refuses to base64-exfiltrate, by design). The only channel that worked: asking Dave to upload the file directly to the GitHub repo via the web UI, then `git fetch`/pull it. For any future "add this photo/file" ask, lead with that path rather than re-attempting local-path or cloud-share delivery.
- Also reconfirmed (see PR #83's HANDOFF entry, still true): this sandbox's Chrome browser-automation tool cannot reach `127.0.0.1`/`localhost` for local dev-server verification — only public internet origins.

## Open follow-up work (not blocking, no active session)

- **Content gap, [issue #55](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/55):** nothing in `content/posts/` between 2015-2024, recovery unscoped.
- **[Issue #24](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/24)** (graph view) — left open as the umbrella for graph follow-ups (R3 ego graph, R4 click-to-recenter/search, R5 degree-based sizing) unless Dave wants it closed and those tracked separately.
- Minor: a malformed internal-link markdown snippet in the "Unite 2014 keynote recap" post, noticed during a prior session's review — not fixed, not blocking.

## Nothing currently in-flight

PRs #83 and #84 are both merged. Next session can start fresh on #55, the graph follow-ups, or new work.
