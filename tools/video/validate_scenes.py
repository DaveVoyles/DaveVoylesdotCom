#!/usr/bin/env python3
"""Mechanical acceptance probe for scenes.json (plan 0005 D2).

Checks the schema documented in PROTOTYPE.md plus the plan's D2 acceptance criteria.
Exits non-zero with a list of failures.

    ./.venv/bin/python validate_scenes.py
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent

WORD_MIN, WORD_MAX = 140, 160
SCENE_MIN, SCENE_MAX = 6, 8


def required_images_for(post_field):
    """Images the scenes' own `post` field's markdown actually references
    (cover + inline) — derived per-post rather than a fixed global set, so
    validation works for any post, not just the one it was first built for.
    Mirrors draft_scenes.py's extract_post_images(); duplicated rather than
    imported so this script stays independently runnable (same precedent as
    count_words()/words() below). Returns an empty set (nothing required) if
    `post_field` is missing or the file can't be found."""
    if not post_field:
        return set()
    post_path = REPO / post_field
    if not post_path.is_file():
        return set()

    text = post_path.read_text()
    if not text.startswith("+++"):
        return set()
    parts = text.split("+++", 2)
    if len(parts) < 3:
        return set()
    fm_text, body = parts[1], parts[2]

    images = set()
    m = re.search(r'image\s*=\s*"([^"]*)"', fm_text)
    if m:
        cover = m.group(1)
        images.add(f"static{cover}" if cover.startswith("/") else f"static/{cover}")
    for m in re.finditer(r"!\[([^\]]*)\]\(([^)]+)\)", body):
        src = m.group(2)
        images.add(f"static{src}" if src.startswith("/") else f"static/{src}")
    return images

# --- claim safety (docs/claim-safe-facts.md) ---------------------------------
# Narration is externally-facing prose, so the plan keeps this gate un-waived.
# Any quantity in the narration must be an allowed metric; anything else is a
# number the post does not attest and must not be invented.
ALLOWED_QUANTITIES = {"twenty", "20"}  # "20+ containers on a homelab I operate"
QUANTITY_RE = re.compile(
    r"\b(\d[\d,.]*|one|two|three|four|five|six|seven|eight|nine|ten|dozen|hundred|"
    r"thousand|million|billion|twenty|thirty|forty|fifty)\b",
    re.I,
)
# Present-tense employment claims are explicitly barred (must stay past tense).
BANNED_PHRASES = [
    (re.compile(r"\b(?:senior\s+)?(?:technical\s+)?program manager at\b", re.I),
     "present-tense employment claim (claim-safe-facts: use 'Former ...')"),
    (re.compile(r"\bI\s+(?:built|created|authored|invented)\b", re.I),
     "authorship claim (claim-safe-facts: prefer 'extended and operates')"),
    (re.compile(r"\b(?:terraform|kubernetes|k8s)\b", re.I),
     "tech listed as do-not-claim in claim-safe-facts"),
]


def check_claims(scenes, fails):
    """Flag narration quantities and phrasings the post/claim-safe-facts don't attest."""
    for s in scenes:
        narration = s.get("narration", "")
        where = f"scene {s.get('id', '?')}"
        for m in QUANTITY_RE.finditer(narration):
            if m.group(0).lower() not in ALLOWED_QUANTITIES:
                fails.append(f"{where}: unattested quantity {m.group(0)!r} in narration")
        for pattern, why in BANNED_PHRASES:
            if pattern.search(narration):
                fails.append(f"{where}: {why}")


def words(text):
    return re.findall(r"[A-Za-z0-9']+", text)


def main():
    # Overridable so callers (e.g. draft_scenes.py) can validate a candidate
    # draft without mutating the tracked tools/video/scenes.json.
    scenes_file = Path(os.environ.get("SCENES_FILE", str(ROOT / "scenes.json")))
    data = json.loads(scenes_file.read_text())
    fails = []

    scenes = data.get("scenes", [])
    if not SCENE_MIN <= len(scenes) <= SCENE_MAX:
        fails.append(f"scene count {len(scenes)} outside {SCENE_MIN}-{SCENE_MAX}")

    ids, total_words, total_secs, used_images = set(), 0, 0.0, set()
    for i, s in enumerate(scenes):
        where = f"scene[{i}] {s.get('id', '<no id>')}"
        for key in ("id", "narration", "headline", "visual", "target_seconds"):
            if key not in s:
                fails.append(f"{where}: missing key {key!r}")
        if "id" in s:
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", s["id"]):
                fails.append(f"{where}: id not filename-safe")
            if s["id"] in ids:
                fails.append(f"{where}: duplicate id")
            ids.add(s["id"])

        total_words += len(words(s.get("narration", "")))
        total_secs += float(s.get("target_seconds", 0))

        # visual is a list of 1+ beats shown in sequence within the scene's
        # clip (more frequent visual changes than one static visual per
        # scene) — a bare dict is also accepted for backward compatibility
        # with a hand-authored single-visual scene.
        raw_visual = s.get("visual", [])
        beats = [raw_visual] if isinstance(raw_visual, dict) else raw_visual
        if not beats:
            fails.append(f"{where}: visual has no beats")
        for bi, v in enumerate(beats):
            bwhere = f"{where} beat[{bi}]"
            if v.get("type") == "image":
                src = v.get("src", "")
                if not (REPO / src).is_file():
                    fails.append(f"{bwhere}: image not found: {src}")
                used_images.add(src)
            elif v.get("type") == "card":
                if not v.get("text"):
                    fails.append(f"{bwhere}: card visual missing 'text'")
            elif v.get("type") == "table":
                if not v.get("headers") or not v.get("rows"):
                    fails.append(f"{bwhere}: table visual missing 'headers' or 'rows'")
            else:
                fails.append(f"{bwhere}: visual.type must be 'card', 'image', or 'table', got {v.get('type')!r}")

    if not WORD_MIN <= total_words <= WORD_MAX:
        fails.append(f"narration {total_words} words outside {WORD_MIN}-{WORD_MAX}")

    required_images = required_images_for(data.get("post"))
    missing = required_images - used_images
    if missing:
        fails.append(f"post illustrations unused: {sorted(missing)}")

    check_claims(scenes, fails)

    print(f"scenes            {len(scenes)}")
    print(f"narration words   {total_words}  (target {WORD_MIN}-{WORD_MAX})")
    print(f"target runtime    {total_secs:.1f}s")
    print(f"post images used  {len(used_images & required_images)}/{len(required_images)}")

    if fails:
        print("\nFAIL:")
        for f in fails:
            print(f"  - {f}")
        sys.exit(1)
    print("\nPASS: scenes.json valid")


if __name__ == "__main__":
    main()
