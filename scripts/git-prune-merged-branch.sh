#!/usr/bin/env bash
# Delete a LOCAL branch, but only after verifying its work has actually
# landed on main — never trust the caller's say-so alone (this is the
# wrapper hooks/git-safety.sh requires in place of a raw `git branch -D`,
# because the safety proof needs to be code, not model judgment).
#
# Verification (either satisfies):
#   1. Ancestry: the branch tip is an ancestor of origin/main (true for
#      rebase+merge / merge-commit strategy).
#   2. A merged GitHub PR whose head branch matches this name (true for
#      squash-merge strategy, where ancestry isn't preserved).
#
# Refuses (never forces past these):
#   - branch is `main`, or the currently checked-out branch
#   - branch is checked out in another worktree
#   - branch doesn't verify as merged by either check above
#
# Usage: scripts/git-prune-merged-branch.sh <branch> [<branch> ...]
set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "usage: $0 <branch> [<branch> ...]" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
git fetch origin main --quiet

current_branch="$(git rev-parse --abbrev-ref HEAD)"

for branch in "$@"; do
  if [[ "$branch" == "main" ]]; then
    echo "refuse: won't delete main" >&2
    exit 1
  fi
  if [[ "$branch" == "$current_branch" ]]; then
    echo "refuse: $branch is the currently checked-out branch" >&2
    exit 1
  fi
  if ! git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "skip (no such local branch): $branch"
    continue
  fi
  if git worktree list | grep -qF "[$branch]"; then
    echo "refuse: $branch is checked out in another worktree" >&2
    exit 1
  fi

  merged=0
  if git merge-base --is-ancestor "$branch" origin/main 2>/dev/null; then
    merged=1
  elif command -v gh >/dev/null 2>&1; then
    pr_state="$(gh pr list --state merged --head "$branch" --json number --jq 'length' --repo DaveVoyles/DaveVoylesdotCom 2>/dev/null || echo 0)"
    [[ "$pr_state" -gt 0 ]] && merged=1
  fi

  if [[ "$merged" -ne 1 ]]; then
    echo "refuse: $branch does not verify as merged (no ancestry, no merged PR) — needs a human to confirm by hand" >&2
    exit 1
  fi

  git branch -D "$branch"
done
