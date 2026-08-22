#!/usr/bin/env bash
# Portable Cloud prove: content/regression tests. Hugo preview stays optional.
set -euo pipefail

ROOT_DIR="${CURSOR_CLOUD_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

if [ ! -f "$ROOT_DIR/Makefile" ] || [ ! -f "$ROOT_DIR/scripts/check-content.sh" ]; then
  echo "setup-cursor-cloud: invalid repository root: $ROOT_DIR" >&2
  exit 1
fi

if ! command -v make >/dev/null 2>&1; then
  echo "setup-cursor-cloud: make is required (install build-essential / Xcode CLT)" >&2
  exit 1
fi

echo "setup-cursor-cloud: running make test"
make -C "$ROOT_DIR" test

echo "setup-cursor-cloud: environment ready"
echo "setup-cursor-cloud: Hugo preview needs PaperMod — run: git submodule update --init --recursive"
