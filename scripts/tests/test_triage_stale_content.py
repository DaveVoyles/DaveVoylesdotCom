#!/usr/bin/env python3
"""
Fixture-based tests for scripts/triage_stale_content.py.

Pure stdlib (unittest) -- no venv/pytest required, matching the script's own
"no dependencies" design. Run directly:

    python3 scripts/tests/test_triage_stale_content.py

All parsing/heuristic logic is exercised against small fixture strings/files
in a temp dir. No live network calls happen in this suite: check_url's own
retry/backoff/method-fallback behavior is tested against a mocked
urllib.request.urlopen (CheckUrlTests), and everywhere else the live-link
path is simply not invoked (--skip-link-check, or an explicit link_cache
passed to evaluate_post()).
"""

import datetime
import shutil
import sys
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import triage_stale_content as t


FIXTURE_STALE = """+++
title = "GDC 2011"
date = "2011-06-23T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["Armless Octopus", "GDC", "Journalism", "XBLIG", "XNA"]
+++

I'll be attending my second GDC conference this year, most specifically for
the UDK game track. I'm also scheduling an XNA meet up for XNA and Xbox
indie developers.
"""

FIXTURE_MODERN = """+++
title = "Some Books At The Top Of My List"
date = "2024-03-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["Books"]
+++

Here are a few books I've been meaning to read. Nothing tech-specific here.
"""

FIXTURE_RECENT_KEYWORD = """+++
title = "Looking back at Windows Phone 8"
date = "2025-06-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["Windows Phone 8"]
+++

A recent retrospective mentioning Windows Phone 8, but written recently
enough that the age heuristic alone should not fire.
"""

FIXTURE_BROKEN_LINK = """+++
title = "A modern post with a dead link"
date = "2024-01-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Tech"]
tags = ["Tech"]
+++

Check out [this old post](http://davevoyles.azurewebsites.net/4351/) for
more details, and see the ![diagram](http://legacy.example.com/img.png "alt").
"""

FIXTURE_ALREADY_DRAFT = """+++
title = "Manually triaged already"
date = "2011-01-01T00:00:00"
draft = true
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["XBLIG"]
+++

This one is already draft = true (prior D6 run or manual D8 override).
"""

FIXTURE_SELF_LINK = """+++
title = "Post with only an internal link"
date = "2024-01-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Tech"]
tags = ["Tech"]
+++

See my [other post](https://davevoyles.com/posts/other-post/) for more.
"""

FIXTURE_YAML = """---
title: "Hello World"
date: 2024-01-15T10:00:00Z
draft: false
---

Not a TOML front-matter post (D1's placeholder) -- should be skipped.
"""

FIXTURE_NO_DRAFT_FIELD = """+++
title = "No draft field at all"
date = "2024-01-01T00:00:00"
author = "Dave Voyles"
categories = ["Tech"]
tags = ["Tech"]
+++

Malformed/unexpected front matter missing the draft key entirely.
"""

FIXTURE_OLD_NO_KEYWORDS = """+++
title = "An old post about nothing dead-tech-related"
date = "2011-01-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Journalism"]
tags = ["PAX"]
+++

An old post (well past AGE_THRESHOLD_YEARS) that never mentions any of the
dead-tech keywords at all -- age alone must never be enough to flag it.
"""

FIXTURE_NESTED_LINKED_IMAGE = """+++
title = "Post with a linked image (this blog's common convention)"
date = "2024-01-01T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Tech"]
tags = ["Tech"]
+++

[![](http://legacy.example.com/thumb.jpg?w=300 "Thumb")](http://legacy.example.com/full.jpg)
"""


class FrontMatterParsingTests(unittest.TestCase):
    def test_load_front_matter_toml(self):
        loaded = t.load_front_matter_from_text(FIXTURE_STALE)
        self.assertIsNotNone(loaded)
        fm, body, fm_end = loaded
        self.assertIn('title = "GDC 2011"', fm)
        self.assertIn("UDK game track", body)

    def test_load_front_matter_rejects_yaml(self):
        self.assertIsNone(t.load_front_matter_from_text(FIXTURE_YAML))

    def test_extract_string_field(self):
        loaded = t.load_front_matter_from_text(FIXTURE_STALE)
        fm, _, _ = loaded
        self.assertEqual(t.extract_string_field(fm, "title"), "GDC 2011")
        self.assertEqual(t.extract_string_field(fm, "author"), "Dave Voyles")
        self.assertIsNone(t.extract_string_field(fm, "nonexistent"))

    def test_extract_list_field(self):
        loaded = t.load_front_matter_from_text(FIXTURE_STALE)
        fm, _, _ = loaded
        self.assertEqual(
            t.extract_list_field(fm, "tags"),
            ["Armless Octopus", "GDC", "Journalism", "XBLIG", "XNA"],
        )
        self.assertEqual(t.extract_list_field(fm, "categories"), ["Journalism"])
        self.assertEqual(t.extract_list_field(fm, "missing"), [])

    def test_parse_post_date(self):
        self.assertEqual(
            t.parse_post_date("2011-06-23T00:00:00"), datetime.date(2011, 6, 23)
        )
        self.assertIsNone(t.parse_post_date(None))
        self.assertIsNone(t.parse_post_date("not-a-date"))


class KeywordDetectionTests(unittest.TestCase):
    def test_finds_multiple_hits(self):
        hits = t.find_keyword_hits("UDK, XNA and XBLIG were all mentioned")
        self.assertIn("UDK", hits)
        self.assertIn("XNA", hits)
        self.assertIn("XBLIG", hits)

    def test_no_hits_on_modern_text(self):
        hits = t.find_keyword_hits("A post about books and podcasts, nothing techy")
        self.assertEqual(hits, [])

    def test_word_boundary_avoids_substring_false_positive(self):
        # "XNAxyz" should not match the "XNA" keyword -- \b enforces a real
        # word boundary so partial-word substrings don't false-positive.
        hits = t.find_keyword_hits("something about XNAxyz the tool")
        self.assertNotIn("XNA", hits)

    def test_case_insensitive(self):
        hits = t.find_keyword_hits("built with udk and xna back in the day")
        self.assertIn("UDK", hits)
        self.assertIn("XNA", hits)


class ExternalUrlTests(unittest.TestCase):
    def test_extracts_external_links_and_images(self):
        loaded = t.load_front_matter_from_text(FIXTURE_BROKEN_LINK)
        _, body, _ = loaded
        urls = t.extract_external_urls(body)
        self.assertIn("http://davevoyles.azurewebsites.net/4351/", urls)
        self.assertIn("http://legacy.example.com/img.png", urls)

    def test_excludes_self_referential_links(self):
        loaded = t.load_front_matter_from_text(FIXTURE_SELF_LINK)
        _, body, _ = loaded
        urls = t.extract_external_urls(body)
        self.assertEqual(urls, [])

    def test_extracts_nested_linked_image_both_urls(self):
        # This blog's common convention: [![alt](img_url "title")](link_url)
        # -- a titled image wrapped in an outer link. Both the inner image
        # URL (with its title attribute) and the outer link URL (untitled)
        # must be extracted, not just whichever comes first.
        loaded = t.load_front_matter_from_text(FIXTURE_NESTED_LINKED_IMAGE)
        _, body, _ = loaded
        urls = t.extract_external_urls(body)
        self.assertIn("http://legacy.example.com/thumb.jpg?w=300", urls)
        self.assertIn("http://legacy.example.com/full.jpg", urls)

    def test_does_not_exclude_lookalike_domain(self):
        # host == "davevoyles.com" or a real subdomain only -- a bare
        # endswith() would wrongly treat "notdavevoyles.com" as
        # self-referential and silently skip checking it.
        body = "[a lookalike domain](http://notdavevoyles.com/page)"
        self.assertEqual(
            t.extract_external_urls(body), ["http://notdavevoyles.com/page"]
        )

    def test_excludes_real_subdomain(self):
        body = "[my other post](https://blog.davevoyles.com/old-post/)"
        self.assertEqual(t.extract_external_urls(body), [])

    def test_dedupes_repeated_urls(self):
        body = (
            "[a](http://example.com/x) and again [b](http://example.com/x)"
        )
        self.assertEqual(t.extract_external_urls(body), ["http://example.com/x"])

    def test_describe_url_image_vs_link(self):
        self.assertEqual(t.describe_url("http://example.com/pic.png"), "image")
        self.assertEqual(t.describe_url("http://example.com/pic.PNG"), "image")
        self.assertEqual(t.describe_url("http://example.com/page/"), "link")


class TomlEscapingTests(unittest.TestCase):
    def test_escapes_each_special_character_to_its_literal_toml_escape(self):
        # Asserts the actual escaped output, not just "no raw newline
        # survived" -- a broken TOML_ESCAPES mapping (e.g. swapped \\n/\\t)
        # would still pass a weaker check.
        self.assertEqual(t.toml_string('a "quote"'), '"a \\"quote\\""')
        self.assertEqual(t.toml_string("back\\slash"), '"back\\\\slash"')
        self.assertEqual(t.toml_string("line\nbreak"), '"line\\nbreak"')
        self.assertEqual(t.toml_string("carriage\rreturn"), '"carriage\\rreturn"')
        self.assertEqual(t.toml_string("a\ttab"), '"a\\ttab"')

    def test_round_trip_all_special_characters_together(self):
        raw = 'a "quoted" value with a backslash \\ and a newline\nhere'
        escaped = t.toml_string(raw)
        self.assertEqual(
            escaped,
            '"a \\"quoted\\" value with a backslash \\\\ and a newline\\nhere"',
        )


class ApplyFlagTests(unittest.TestCase):
    def test_flips_draft_and_inserts_reason(self):
        loaded = t.load_front_matter_from_text(FIXTURE_MODERN)
        _, _, fm_end = loaded
        # load_front_matter_from_text doesn't hand back the full original
        # text, so rebuild it the way load_front_matter (path-based) does.
        text = FIXTURE_MODERN
        new_text = t.apply_flag(text, fm_end, "dead-tech keywords (XNA); 12.0 years old")
        self.assertIn("draft = true", new_text)
        self.assertNotRegex(new_text, r"(?m)^draft = false$")
        self.assertIn('stale_reason = "dead-tech keywords (XNA); 12.0 years old"', new_text)

    def test_raises_if_no_draft_false_present(self):
        with self.assertRaises(ValueError):
            t.apply_flag(FIXTURE_ALREADY_DRAFT, 10, "irrelevant")

    def test_escapes_quotes_in_reason(self):
        text = FIXTURE_MODERN
        loaded = t.load_front_matter_from_text(FIXTURE_MODERN)
        _, _, fm_end = loaded
        new_text = t.apply_flag(text, fm_end, 'broken link: "quoted" url')
        self.assertIn('stale_reason = "broken link: \\"quoted\\" url"', new_text)


class EvaluatePostTests(unittest.TestCase):
    def test_old_post_with_keyword_is_flagged(self):
        loaded = t.load_front_matter_from_text(FIXTURE_STALE)
        fm, body, _ = loaded
        reasons, detail = t.evaluate_post(fm, body, link_cache={})
        self.assertTrue(reasons)
        self.assertIn("UDK", detail["keyword_hits"])
        self.assertIn("XNA", detail["keyword_hits"])
        self.assertGreater(detail["age_years"], t.AGE_THRESHOLD_YEARS)

    def test_modern_post_with_no_keywords_is_unflagged(self):
        loaded = t.load_front_matter_from_text(FIXTURE_MODERN)
        fm, body, _ = loaded
        reasons, detail = t.evaluate_post(fm, body, link_cache={})
        self.assertEqual(reasons, [])

    def test_old_post_with_no_keywords_is_unflagged(self):
        # Age heuristic requirement, the other direction: a post well past
        # AGE_THRESHOLD_YEARS but with NO dead-tech keyword hit must not be
        # flagged by age alone -- age is only ever a co-signal.
        loaded = t.load_front_matter_from_text(FIXTURE_OLD_NO_KEYWORDS)
        fm, body, _ = loaded
        reasons, detail = t.evaluate_post(fm, body, link_cache={})
        self.assertEqual(detail["keyword_hits"], [])
        self.assertGreater(detail["age_years"], t.AGE_THRESHOLD_YEARS)
        self.assertEqual(reasons, [])

    def test_recent_post_with_keyword_alone_is_unflagged(self):
        # Age heuristic requirement: a keyword hit on a *recent* post must
        # NOT trigger the age-combined reason (age < AGE_THRESHOLD_YEARS).
        loaded = t.load_front_matter_from_text(FIXTURE_RECENT_KEYWORD)
        fm, body, _ = loaded
        reasons, detail = t.evaluate_post(fm, body, link_cache={})
        self.assertIn("Windows Phone 8", detail["keyword_hits"])
        self.assertLess(detail["age_years"], t.AGE_THRESHOLD_YEARS)
        self.assertEqual(reasons, [])

    def test_broken_link_flags_regardless_of_age(self):
        loaded = t.load_front_matter_from_text(FIXTURE_BROKEN_LINK)
        fm, body, _ = loaded
        link_cache = {
            "http://davevoyles.azurewebsites.net/4351/": (False, "connection error"),
            "http://legacy.example.com/img.png": (True, "200"),
        }
        reasons, detail = t.evaluate_post(fm, body, link_cache=link_cache)
        self.assertTrue(any("broken outbound reference" in r for r in reasons))
        self.assertEqual(len(detail["broken_links"]), 1)

    def test_ok_links_do_not_flag(self):
        loaded = t.load_front_matter_from_text(FIXTURE_BROKEN_LINK)
        fm, body, _ = loaded
        link_cache = {
            "http://davevoyles.azurewebsites.net/4351/": (True, "200"),
            "http://legacy.example.com/img.png": (True, "200"),
        }
        reasons, detail = t.evaluate_post(fm, body, link_cache=link_cache)
        self.assertEqual(detail["broken_links"], [])


class _FakeResponse:
    """Minimal context-manager stand-in for urllib's HTTPResponse -- only
    the `.status` attribute and `with ... as resp:` protocol check_url()
    actually uses."""

    def __init__(self, status):
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False


def _http_error(code):
    return urllib.error.HTTPError("http://example.com/x", code, str(code), None, None)


class CheckUrlTests(unittest.TestCase):
    """check_url() against a mocked urllib.request.urlopen -- deterministic,
    zero network calls, and time.sleep patched out so retry/backoff paths
    don't actually slow the suite down."""

    def setUp(self):
        patcher = mock.patch("triage_stale_content.time.sleep")
        self.addCleanup(patcher.stop)
        self.mock_sleep = patcher.start()

    def test_head_success_returns_ok(self):
        with mock.patch(
            "triage_stale_content.urllib.request.urlopen",
            side_effect=[_FakeResponse(200)],
        ) as mock_urlopen:
            ok, detail = t.check_url("http://example.com/x")
        self.assertTrue(ok)
        self.assertEqual(detail, "200")
        self.assertEqual(mock_urlopen.call_count, 1)
        self.assertEqual(mock_urlopen.call_args.args[0].get_method(), "HEAD")

    def test_permanent_http_error_fails_without_retry(self):
        with mock.patch(
            "triage_stale_content.urllib.request.urlopen",
            side_effect=[_http_error(404)],
        ) as mock_urlopen:
            ok, detail = t.check_url("http://example.com/x")
        self.assertFalse(ok)
        self.assertEqual(detail, "HTTP 404")
        # A non-retryable status (404 isn't in the 429/500/502/503/504 set)
        # must fail immediately -- one call, no backoff sleep.
        self.assertEqual(mock_urlopen.call_count, 1)
        self.mock_sleep.assert_not_called()

    def test_405_on_head_permanently_switches_to_get(self):
        with mock.patch(
            "triage_stale_content.urllib.request.urlopen",
            side_effect=[_http_error(405), _FakeResponse(200)],
        ) as mock_urlopen:
            ok, detail = t.check_url("http://example.com/x")
        self.assertTrue(ok)
        methods = [c.args[0].get_method() for c in mock_urlopen.call_args_list]
        self.assertEqual(methods, ["HEAD", "GET"])
        # The 405-driven method switch doesn't consume a retry/backoff slot.
        self.mock_sleep.assert_not_called()

    def test_transient_error_retries_with_backoff_then_succeeds(self):
        with mock.patch(
            "triage_stale_content.urllib.request.urlopen",
            side_effect=[_http_error(503), _FakeResponse(200)],
        ) as mock_urlopen:
            ok, detail = t.check_url("http://example.com/x")
        self.assertTrue(ok)
        self.assertEqual(mock_urlopen.call_count, 2)
        self.mock_sleep.assert_called_once()

    def test_405_then_transient_error_still_gets_backoff_retry(self):
        # Regression test for the fix to check_url: a server that 405s on
        # HEAD and then hits a transient error on the GET fallback must
        # still get a backed-off retry, not an immediate hard failure.
        with mock.patch(
            "triage_stale_content.urllib.request.urlopen",
            side_effect=[_http_error(405), _http_error(503), _FakeResponse(200)],
        ) as mock_urlopen:
            ok, detail = t.check_url("http://example.com/x")
        self.assertTrue(ok)
        methods = [c.args[0].get_method() for c in mock_urlopen.call_args_list]
        self.assertEqual(methods, ["HEAD", "GET", "GET"])
        self.mock_sleep.assert_called_once()

    def test_exhausts_retries_on_persistent_connection_error(self):
        with mock.patch(
            "triage_stale_content.urllib.request.urlopen",
            side_effect=urllib.error.URLError("boom"),
        ) as mock_urlopen:
            ok, detail = t.check_url("http://example.com/x", max_retries=2)
        self.assertFalse(ok)
        self.assertIn("connection error", detail)
        # MAX_RETRIES=2 -> 3 total attempts (initial + 2 retries).
        self.assertEqual(mock_urlopen.call_count, 3)
        self.assertEqual(self.mock_sleep.call_count, 2)


class EndToEndDryRunTests(unittest.TestCase):
    """Exercises main()'s file-scanning/writing behavior against a temp
    content dir, with live link-checking skipped (--skip-link-check) so this
    suite makes zero network calls."""

    def setUp(self):
        self.tmpdir = Path(tempfile.mkdtemp())
        self.content_dir = self.tmpdir / "content" / "posts"
        self.content_dir.mkdir(parents=True)
        self._write("stale-post.md", FIXTURE_STALE)
        self._write("modern-post.md", FIXTURE_MODERN)
        self._write("already-draft.md", FIXTURE_ALREADY_DRAFT)
        self._write("hello-world.md", FIXTURE_YAML)
        self._write("no-draft-field.md", FIXTURE_NO_DRAFT_FIELD)

        self._orig_content_dir = t.CONTENT_DIR
        self._orig_argv = sys.argv
        t.CONTENT_DIR = self.content_dir

    def tearDown(self):
        t.CONTENT_DIR = self._orig_content_dir
        sys.argv = self._orig_argv
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def _write(self, name, content):
        (self.content_dir / name).write_text(content, encoding="utf-8")

    def _read(self, name):
        return (self.content_dir / name).read_text(encoding="utf-8")

    def test_dry_run_writes_nothing(self):
        sys.argv = ["triage_stale_content.py", "--dry-run", "--skip-link-check"]
        t.main()
        # Nothing on disk should have changed under --dry-run.
        self.assertIn("draft = false", self._read("stale-post.md"))
        self.assertNotIn("stale_reason", self._read("stale-post.md"))

    def test_real_run_flags_only_stale_post(self):
        sys.argv = ["triage_stale_content.py", "--skip-link-check"]
        t.main()

        stale = self._read("stale-post.md")
        self.assertIn("draft = true", stale)
        self.assertIn("stale_reason =", stale)

        modern = self._read("modern-post.md")
        self.assertIn("draft = false", modern)
        self.assertNotIn("stale_reason", modern)

        # Already draft = true is left byte-for-byte untouched.
        self.assertEqual(self._read("already-draft.md"), FIXTURE_ALREADY_DRAFT)

    def test_yaml_and_missing_draft_field_are_skipped_not_crashed(self):
        sys.argv = ["triage_stale_content.py", "--skip-link-check"]
        # Should not raise despite hello-world.md (YAML) and
        # no-draft-field.md (TOML but no draft key) being present.
        t.main()
        self.assertEqual(self._read("hello-world.md"), FIXTURE_YAML)
        self.assertEqual(self._read("no-draft-field.md"), FIXTURE_NO_DRAFT_FIELD)

    def test_limit_processes_only_first_n_files(self):
        # iter_candidate_files() sorts before slicing, so with --limit 2
        # only the two alphabetically-first files are candidates at all;
        # main() must not touch stale-post.md (sorts last) in that case.
        self.assertEqual(
            [p.name for p in t.iter_candidate_files(limit=2)],
            ["already-draft.md", "hello-world.md"],
        )
        sys.argv = ["triage_stale_content.py", "--skip-link-check", "--limit", "2"]
        t.main()
        self.assertIn("draft = false", self._read("stale-post.md"))
        self.assertNotIn("stale_reason", self._read("stale-post.md"))

    def test_live_link_check_wiring_flags_on_mocked_broken_link(self):
        # Exercises main()'s live-link-check path end-to-end (all_urls
        # collection -> build_link_cache -> link_cache passed into
        # evaluate_post) without --skip-link-check, by mocking check_url
        # itself so no real network call happens.
        self._write("link-post.md", FIXTURE_BROKEN_LINK)
        sys.argv = ["triage_stale_content.py"]
        with mock.patch(
            "triage_stale_content.check_url",
            return_value=(False, "connection error: mocked"),
        ) as mock_check_url:
            t.main()
        self.assertTrue(mock_check_url.called)
        flagged = self._read("link-post.md")
        self.assertIn("draft = true", flagged)
        self.assertIn("broken outbound reference(s)", flagged)

    def test_link_limit_caps_number_of_urls_checked(self):
        self._write("link-post.md", FIXTURE_BROKEN_LINK)  # 2 external URLs
        sys.argv = ["triage_stale_content.py", "--link-limit", "1"]
        with mock.patch(
            "triage_stale_content.check_url", return_value=(True, "200")
        ) as mock_check_url:
            t.main()
        self.assertEqual(mock_check_url.call_count, 1)


class MainArgParsingTests(unittest.TestCase):
    """CLI argument handling in main() -- --limit/--link-limit value
    parsing and the unrecognized-argument exit path. Uses a temp content
    dir with zero posts so these tests stay focused on arg parsing, not
    triage logic (covered elsewhere)."""

    def setUp(self):
        self.tmpdir = Path(tempfile.mkdtemp())
        self.content_dir = self.tmpdir / "content" / "posts"
        self.content_dir.mkdir(parents=True)
        self._orig_content_dir = t.CONTENT_DIR
        self._orig_argv = sys.argv
        t.CONTENT_DIR = self.content_dir

    def tearDown(self):
        t.CONTENT_DIR = self._orig_content_dir
        sys.argv = self._orig_argv
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_unrecognized_argument_exits_nonzero(self):
        sys.argv = ["triage_stale_content.py", "--not-a-real-flag"]
        with self.assertRaises(SystemExit) as ctx:
            t.main()
        self.assertNotEqual(ctx.exception.code, 0)

    def test_limit_missing_value_exits_nonzero(self):
        sys.argv = ["triage_stale_content.py", "--limit"]
        with self.assertRaises(SystemExit) as ctx:
            t.main()
        self.assertNotEqual(ctx.exception.code, 0)

    def test_link_limit_missing_value_exits_nonzero(self):
        sys.argv = ["triage_stale_content.py", "--link-limit"]
        with self.assertRaises(SystemExit) as ctx:
            t.main()
        self.assertNotEqual(ctx.exception.code, 0)

    def test_valid_flags_on_empty_content_dir_run_cleanly(self):
        sys.argv = [
            "triage_stale_content.py",
            "--dry-run",
            "--skip-link-check",
            "--limit",
            "5",
            "--link-limit",
            "5",
        ]
        t.main()  # should not raise on an empty candidate list


if __name__ == "__main__":
    unittest.main()
