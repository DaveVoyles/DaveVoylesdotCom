#!/usr/bin/env python3
"""
Fixture-based tests for scripts/topics_mapping.py.

Pure stdlib (unittest) -- no venv/pytest required, matching this repo's
other script tests. Run directly:

    python3 scripts/tests/test_topics_mapping.py
"""

import contextlib
import io
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import topics_mapping as t


FIXTURE_GAMING = """+++
title = "GDC 2011"
date = "2011-06-23T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["Armless Octopus", "GDC", "XBLIG", "XNA"]
+++

I'll be attending my second GDC conference this year, most specifically for
the UDK game track.
"""

FIXTURE_MULTI_TOPIC = """+++
title = "Tutorials: Creating your first website with Azure"
date = "2015-12-14T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Azure", "BizSpark", "Programming", "Students", "Tutorial"]
tags = ["Azure", "BizSpark", "Programming", "Students", "Tutorial"]
+++

A tutorial for students on building a website with Azure.
"""

FIXTURE_UNMAPPED = """+++
title = "A hurricane came through my house"
date = "2011-08-30T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Uncategorized"]
tags = ["Hurricane", "Irene", "PAX"]
+++

Apparently a hurricane came through while I was at PAX.
"""

FIXTURE_TRULY_UNMAPPED = """+++
title = "Some Books At The Top Of My List"
date = "2024-03-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Uncategorized"]
tags = ["Books"]
+++

Nothing here maps to a topic bucket.
"""

FIXTURE_ALREADY_TAGGED = """+++
title = "Already has topics"
date = "2011-01-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["XBLIG"]
topics = ["Career and Students"]
+++

A post a human already hand-assigned to a topic that the lookup table
would NOT have picked -- re-running must never overwrite this.
"""

FIXTURE_YAML = """---
title: "Hello World"
date: 2024-01-15T10:00:00Z
draft: false
tags: ["Meta"]
---

Not a TOML front-matter post -- should be skipped and reported.
"""


class FrontMatterParsingTests(unittest.TestCase):
    def _write(self, tmp, name, content):
        path = Path(tmp) / name
        path.write_text(content, encoding="utf-8")
        return path

    def test_load_front_matter_toml(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp, "a.md", FIXTURE_GAMING)
            loaded = t.load_front_matter(path)
            self.assertIsNotNone(loaded)
            text, fm, fm_start, fm_end = loaded
            self.assertIn('title = "GDC 2011"', fm)

    def test_load_front_matter_rejects_yaml(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp, "hello-world.md", FIXTURE_YAML)
            self.assertIsNone(t.load_front_matter(path))

    def test_extract_list_field(self):
        loaded = None
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp, "a.md", FIXTURE_MULTI_TOPIC)
            loaded = t.load_front_matter(path)
        _, fm, _, _ = loaded
        self.assertEqual(
            t.extract_list_field(fm, "tags"),
            ["Azure", "BizSpark", "Programming", "Students", "Tutorial"],
        )

    def test_has_topics_field(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp, "a.md", FIXTURE_ALREADY_TAGGED)
            _, fm, _, _ = t.load_front_matter(path)
        self.assertTrue(t.has_topics_field(fm))

        with tempfile.TemporaryDirectory() as tmp:
            path = self._write(tmp, "a.md", FIXTURE_GAMING)
            _, fm, _, _ = t.load_front_matter(path)
        self.assertFalse(t.has_topics_field(fm))


class MapPostTopicsTests(unittest.TestCase):
    def test_maps_gaming_tags(self):
        topics = t.map_post_topics(
            tags=["Armless Octopus", "GDC", "XBLIG", "XNA"],
            categories=["Journalism"],
        )
        # Armless Octopus -> Journalism, Marketing and PR, GDC/XBLIG/XNA -> Gaming
        self.assertEqual(topics, ["Gaming", "Journalism, Marketing and PR"])

    def test_multiple_topics_deduped_and_canonical_order(self):
        topics = t.map_post_topics(
            tags=["Azure", "BizSpark", "Programming", "Students", "Tutorial"],
            categories=["Azure", "BizSpark", "Programming", "Students", "Tutorial"],
        )
        # Programming/Azure/Tutorial -> Tech, Students/BizSpark -> Career and Students
        self.assertEqual(topics, ["Tech", "Career and Students"])

    def test_case_insensitive_matching(self):
        topics = t.map_post_topics(tags=["gaming"], categories=[])
        self.assertEqual(topics, ["Gaming"])

    def test_unmapped_tags_produce_no_topics(self):
        topics = t.map_post_topics(tags=["Hurricane", "Irene"], categories=["Uncategorized"])
        self.assertEqual(topics, [])

    def test_partial_match_still_assigns(self):
        # PAX matches Gaming even though Hurricane/Irene/Uncategorized don't match anything.
        topics = t.map_post_topics(tags=["Hurricane", "Irene", "PAX"], categories=["Uncategorized"])
        self.assertEqual(topics, ["Gaming"])


class ApplyTopicsFieldTests(unittest.TestCase):
    def test_appends_topics_line_and_preserves_rest(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "a.md"
            path.write_text(FIXTURE_GAMING, encoding="utf-8")
            text, fm, fm_start, fm_end = t.load_front_matter(path)

        new_text = t.apply_topics_field(text, fm, fm_start, fm_end, ["Gaming", "Journalism, Marketing and PR"])
        self.assertIn('topics = ["Gaming", "Journalism, Marketing and PR"]', new_text)
        # Existing fields untouched.
        self.assertIn('tags = ["Armless Octopus", "GDC", "XBLIG", "XNA"]', new_text)
        self.assertIn('categories = ["Journalism"]', new_text)
        # Body preserved after the front matter.
        self.assertIn("I'll be attending my second GDC conference", new_text)
        # Still valid front matter (single well-formed +++ block).
        self.assertEqual(new_text.count("+++"), 2)


class MainDrivenEndToEndTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.content_dir = Path(self.tmp) / "content" / "posts"
        self.content_dir.mkdir(parents=True)
        self._orig_content_dir = t.CONTENT_DIR
        t.CONTENT_DIR = self.content_dir

    def tearDown(self):
        t.CONTENT_DIR = self._orig_content_dir
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _write(self, name, content):
        (self.content_dir / name).write_text(content, encoding="utf-8")

    def test_dry_run_does_not_write_files(self):
        self._write("gaming.md", FIXTURE_GAMING)
        original = (self.content_dir / "gaming.md").read_text(encoding="utf-8")
        sys_argv_backup = sys.argv
        sys.argv = ["topics_mapping.py", "--dry-run"]
        try:
            t.main()
        finally:
            sys.argv = sys_argv_backup
        self.assertEqual((self.content_dir / "gaming.md").read_text(encoding="utf-8"), original)

    def test_real_run_writes_topics_and_report(self):
        self._write("gaming.md", FIXTURE_GAMING)
        self._write("unmapped.md", FIXTURE_TRULY_UNMAPPED)
        self._write("already.md", FIXTURE_ALREADY_TAGGED)

        sys_argv_backup = sys.argv
        sys.argv = ["topics_mapping.py"]
        try:
            t.main()
        finally:
            sys.argv = sys_argv_backup

        gaming_text = (self.content_dir / "gaming.md").read_text(encoding="utf-8")
        self.assertIn('topics = ["Gaming", "Journalism, Marketing and PR"]', gaming_text)

        unmapped_text = (self.content_dir / "unmapped.md").read_text(encoding="utf-8")
        self.assertNotIn("topics =", unmapped_text)

        # Idempotent: a post that already had a (human-assigned) topics
        # field is left completely untouched, even though the lookup table
        # would have picked a different bucket for its tags.
        already_text = (self.content_dir / "already.md").read_text(encoding="utf-8")
        self.assertIn('topics = ["Career and Students"]', already_text)
        self.assertEqual(already_text.count("topics ="), 1)

    def test_rerun_is_idempotent(self):
        self._write("gaming.md", FIXTURE_GAMING)

        sys_argv_backup = sys.argv
        sys.argv = ["topics_mapping.py"]
        try:
            t.main()
            first_pass = (self.content_dir / "gaming.md").read_text(encoding="utf-8")
            t.main()
            second_pass = (self.content_dir / "gaming.md").read_text(encoding="utf-8")
        finally:
            sys.argv = sys_argv_backup

        self.assertEqual(first_pass, second_pass)
        self.assertEqual(second_pass.count("topics ="), 1)

    def test_unmapped_report_content_is_printed(self):
        # D1's acceptance criteria requires unmapped posts be "written to a
        # separate report for manual spot-check" -- assert the printed
        # summary actually names the file and the reason, not just that no
        # `topics` field was written to disk.
        self._write("unmapped.md", FIXTURE_TRULY_UNMAPPED)

        sys_argv_backup = sys.argv
        sys.argv = ["topics_mapping.py"]
        captured = io.StringIO()
        try:
            with contextlib.redirect_stdout(captured):
                t.main()
        finally:
            sys.argv = sys_argv_backup

        output = captured.getvalue()
        self.assertIn("UNMAPPED (needs manual review): 1", output)
        self.assertIn("unmapped.md", output)
        self.assertIn("tags=['Books']", output)

    def test_yaml_front_matter_post_reported_not_written(self):
        self._write("hello-world.md", FIXTURE_YAML)

        sys_argv_backup = sys.argv
        sys.argv = ["topics_mapping.py"]
        try:
            t.main()
        finally:
            sys.argv = sys_argv_backup

        text = (self.content_dir / "hello-world.md").read_text(encoding="utf-8")
        self.assertEqual(text, FIXTURE_YAML)


class ArgParsingTests(unittest.TestCase):
    def test_dry_run_flag(self):
        dry_run, limit = t.parse_args(["--dry-run"])
        self.assertTrue(dry_run)
        self.assertIsNone(limit)

    def test_limit_flag(self):
        dry_run, limit = t.parse_args(["--limit", "5"])
        self.assertFalse(dry_run)
        self.assertEqual(limit, 5)


if __name__ == "__main__":
    unittest.main()
