#!/usr/bin/env python3
"""Verify the YouTube OAuth credential authenticates — plan 0006 D6.

Runs (or reuses a cached) OAuth authorization against the upload-only scope,
then makes one read-back call to prove the token actually works end-to-end.

The read-back call is Google's OAuth tokeninfo endpoint, not a YouTube Data
API call — youtube.upload is deliberately narrow (videos.insert/update/
delete/rate only; confirmed live that it does NOT cover channels.list or
videos.list(mine=True), both of which 403 with "insufficient authentication
scopes"). tokeninfo requires no YouTube-specific scope at all, so it proves
the token is valid and carries exactly the expected scope without needing to
broaden past upload-only. The actual YouTube-API-level proof that the token
authenticates against YouTube specifically is D7's live upload probe.

    ./.venv/bin/python check_auth.py

Credential locations (outside the repo, per the secret-handoff convention):
    ~/.config/davevoyles-video/credentials.json  (OAuth client, Dave-provided)
    ~/.config/davevoyles-video/token.json         (cached user token, written here)
"""
import os
import sys
import tempfile
from pathlib import Path

import requests
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
CONFIG_DIR = Path.home() / ".config" / "davevoyles-video"
CREDENTIALS_PATH = CONFIG_DIR / "credentials.json"
TOKEN_PATH = CONFIG_DIR / "token.json"
TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
REQUEST_TIMEOUT = 15


def _write_token_0600(creds):
    """Write the token file 0600 from creation (no default-umask window) and
    atomically (a crash mid-write can't leave a truncated/corrupt file that a
    later run would fail to parse)."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=str(CONFIG_DIR), prefix=".token-", suffix=".tmp")
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(creds.to_json())
        os.replace(tmp_path, TOKEN_PATH)
    except BaseException:
        Path(tmp_path).unlink(missing_ok=True)
        raise


def get_credentials():
    if not CREDENTIALS_PATH.exists():
        print(f"error: no OAuth client at {CREDENTIALS_PATH}", file=sys.stderr)
        sys.exit(1)

    creds = None
    if TOKEN_PATH.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
        except (ValueError, OSError) as e:
            print(
                f"warning: cached token at {TOKEN_PATH} is unreadable ({e}) — "
                "re-authorizing from scratch",
                file=sys.stderr,
            )

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except GoogleAuthError as e:
                # Catches both RefreshError (bad/revoked refresh token) and
                # TransportError (network failure during the refresh call) —
                # they're sibling exceptions, not one a subclass of the
                # other, so both need handling here.
                print(
                    f"error: cached token could not be refreshed ({e}) — "
                    f"delete {TOKEN_PATH} and re-run to re-authorize from scratch",
                    file=sys.stderr,
                )
                sys.exit(1)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)
        _write_token_0600(creds)

    return creds


def main():
    creds = get_credentials()
    print(f"token acquired (length {len(creds.token or '')}, expiry {creds.expiry})")

    try:
        resp = requests.get(
            TOKENINFO_URL, params={"access_token": creds.token}, timeout=REQUEST_TIMEOUT
        )
        resp.raise_for_status()
        info = resp.json()
    except (requests.RequestException, ValueError):
        # Deliberately not including the exception's own str() here: it can
        # embed the full request URL, which includes the raw access_token as
        # a query parameter — never let a token value reach stderr/logs.
        # ValueError also covers resp.json() failing on a non-JSON 200 body
        # (e.g. a captive portal/proxy intercepting the request).
        print(
            "error: tokeninfo read-back call failed (network error, invalid/expired "
            "token, or a non-JSON response)",
            file=sys.stderr,
        )
        sys.exit(1)

    scope_ok = info.get("scope") == SCOPES[0]
    audience_ok = info.get("aud") == creds.client_id

    print("read-back call response:")
    print(f"  scope: {info.get('scope')}")
    print(f"  audience matches our client_id: {audience_ok}")
    print(f"  expires_in: {info.get('expires_in')}s")

    if not scope_ok or not audience_ok:
        print(
            "\nFAIL: token introspection succeeded but scope/audience don't match "
            f"expected values (expected scope={SCOPES[0]!r})",
            file=sys.stderr,
        )
        sys.exit(1)

    print("\nPASS: OAuth credential authenticates")


if __name__ == "__main__":
    main()
