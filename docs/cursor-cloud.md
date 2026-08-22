# Cursor Cloud vs Mini

Cloud: `scripts/setup-cursor-cloud.sh` runs `make test` (content gates, no live Pages deploy).

Mini / local: `git submodule update --init --recursive`, `make preview` / `make build` (Hugo + PaperMod), Pages deploy from CI.

Do not put site secrets or a local MainVault path into the Cloud environment.
