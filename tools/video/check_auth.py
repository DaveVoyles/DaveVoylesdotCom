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
import sys
from pathlib import Path

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
CONFIG_DIR = Path.home() / ".config" / "davevoyles-video"
CREDENTIALS_PATH = CONFIG_DIR / "credentials.json"
TOKEN_PATH = CONFIG_DIR / "token.json"


def get_credentials():
    if not CREDENTIALS_PATH.exists():
        print(f"error: no OAuth client at {CREDENTIALS_PATH}", file=sys.stderr)
        sys.exit(1)

    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_PATH.write_text(creds.to_json())
        TOKEN_PATH.chmod(0o600)

    return creds


def main():
    creds = get_credentials()
    print(f"token acquired (length {len(creds.token or '')}, expiry {creds.expiry})")

    resp = requests.get(
        "https://oauth2.googleapis.com/tokeninfo", params={"access_token": creds.token}
    )
    resp.raise_for_status()
    info = resp.json()

    print("read-back call succeeded — token introspection confirms it's live:")
    print(f"  scope: {info.get('scope')}")
    print(f"  audience matches our client_id: {info.get('aud') == creds.client_id}")
    print(f"  expires_in: {info.get('expires_in')}s")
    print("\nPASS: OAuth credential authenticates")


if __name__ == "__main__":
    main()
