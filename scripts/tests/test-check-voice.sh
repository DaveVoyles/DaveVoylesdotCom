#!/usr/bin/env bash
# Tests for scripts/check-voice.sh. One planted failing fixture per rule, one
# passing fixture, plus checks for code stripping, voice_exempt, the
# newer-post-only report, and that `make check` never calls the voice script.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
command -v node >/dev/null 2>&1 || { echo "SKIP: node not installed"; exit 0; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fails=0
ok() { echo "ok   $1"; }
bad() { echo "FAIL $1"; fails=$((fails + 1)); }

GOOD_BODY='Last Tuesday my build bot posted the same comment four times and then went quiet. I traced it to a retry loop that never saw its own earlier reply. The fix was one line and a test.

The test posts a comment, runs the loop twice, and counts replies. It had never existed before that afternoon. I keep it next to the loop so the next change trips on it.

I still do not know why the loop ran at all.'

# new_dir NAME -> creates $TMP/NAME/ with three older posts and echoes the path
new_dir() {
  local d="$TMP/$1"
  mkdir -p "$d"
  local i
  for i in 1 2 3; do
    cat > "$d/prior$i.md" <<EOF
+++
title = "Prior $i"
date = "2026-10-0$i"
draft = false
+++

Opening line number $i is unique to this older post.

## Heading alpha $i

Some text.

## Heading beta $i

More text.

## Last heading $i

End.
EOF
  done
  echo "$d"
}

# post DIR NAME DATE BODY [EXTRA_FRONT]
post() {
  printf '+++\ntitle = "T"\ndate = "%s"\ndraft = false\n%s\n+++\n\n%s\n' "$3" "${5:-}" "$4" > "$1/$2.md"
}

run() { ./scripts/check-voice.sh --dir "$1" 2>&1; }

expect_rule() { # name dir rule
  local out; out="$(run "$2")"
  if echo "$out" | grep -q "WARN .*: $3:"; then ok "$1"; else bad "$1 (no '$3' finding)"; echo "$out" | sed 's/^/     /'; fi
}

# 1. Passing fixture: zero findings.
d="$(new_dir pass)"; post "$d" new 2026-11-10 "$GOOD_BODY"
out="$(run "$d")"
if echo "$out" | grep -q '^WARN'; then bad "passing fixture has findings"; echo "$out" | sed 's/^/     /'; else ok "passing fixture is clean"; fi
if echo "$out" | grep -q '1 post(s) dated 2026-11-01 or later, 0 finding(s)'; then ok "passing fixture counts one checked post"; else bad "summary line"; fi

# 2. score >= 20
d="$(new_dir score)"
post "$d" new 2026-11-10 'In today'"'"'s fast-paced digital landscape, this comprehensive and robust solution serves as a testament to seamless, transformative, cutting-edge innovation. Let'"'"'s dive in. It is not just a tool, it is a game-changer that will unlock the potential of your ecosystem. Here'"'"'s the thing: we will delve into a holistic, scalable, actionable journey. The future looks bright, and the possibilities are endless. Additionally, it plays a pivotal role in the realm of best practices, moving forward.'
expect_rule "score rule fires" "$d" score

# 3. bold over budget
d="$(new_dir bold)"
post "$d" new 2026-11-10 "$GOOD_BODY

This has **one** and **two** and **three** bold spans in a short post."
expect_rule "bold rule fires" "$d" bold

# 4. em dash
d="$(new_dir dash)"; post "$d" new 2026-11-10 "$GOOD_BODY

The loop ran — then stopped."
sed -i.bak 's/\\u2014/—/' "$d/new.md" && rm -f "$d/new.md.bak"
expect_rule "em-dash rule fires" "$d" em-dash

# 5. retired phrase
d="$(new_dir phrase)"; post "$d" new 2026-11-10 "$GOOD_BODY

That was the annoying part."
expect_rule "retired-phrase rule fires" "$d" retired-phrase

# 6. four checklist headings
d="$(new_dir checklist)"
post "$d" new 2026-11-10 "$GOOD_BODY

## In brief

a

## Situation

b

## Decision

c

## Failure modes

d"
expect_rule "checklist-headings rule fires" "$d" checklist-headings

# 7. same first sentence as one of the three prior posts
d="$(new_dir first)"
post "$d" new 2026-11-10 "Opening line number 2 is unique to this older post. And then more."
expect_rule "first-sentence rule fires" "$d" first-sentence

# 8. same final H2 as a prior post
d="$(new_dir final)"
post "$d" new 2026-11-10 "$GOOD_BODY

## Something new

x

## Last heading 3

y"
expect_rule "final-heading rule fires" "$d" final-heading

# 9. more than three H2s shared with one prior post
d="$(new_dir shared)"
cat > "$d/prior1.md" <<'EOF'
+++
title = "Prior 1"
date = "2026-10-01"
draft = false
+++

Opening line number 1 is unique.

## One

a

## Two

b

## Three

c

## Four

d
EOF
post "$d" new 2026-11-10 "$GOOD_BODY

## One

a

## Two

b

## Three

c

## Four

d

## Own ending

e"
expect_rule "shared-headings rule fires" "$d" shared-headings

# 10. fenced code, inline code and block quotes are stripped first
d="$(new_dir stripped)"
post "$d" new 2026-11-10 "$GOOD_BODY

\`\`\`
**a** **b** **c** — em dash in code, That was the annoying part
## In brief
## Situation
## Decision
## Failure modes
\`\`\`

Run \`a — b\` and see.

> A quoted — line. That was the annoying part."
out="$(run "$d")"
if echo "$out" | grep -q '^WARN'; then bad "code and quotes were not stripped"; echo "$out" | sed 's/^/     /'; else ok "code, inline code and block quotes are stripped"; fi

# 11. voice_exempt with a reason silences the rule; without a reason it does not
d="$(new_dir exempt)"
post "$d" new 2026-11-10 "$GOOD_BODY

That was the annoying part." 'voice_exempt = ["retired-phrase"]
voice_exempt_reason = "quoting the old post on purpose"'
out="$(run "$d")"
if echo "$out" | grep -q '^WARN'; then bad "voice_exempt with reason still warned"; else ok "voice_exempt with a reason silences the rule"; fi
post "$d" new 2026-11-10 "$GOOD_BODY

That was the annoying part." 'voice_exempt = ["retired-phrase"]'
out="$(run "$d")"
if echo "$out" | grep -q 'voice_exempt:' && echo "$out" | grep -q 'retired-phrase:'; then ok "voice_exempt without a reason is ignored and reported"; else bad "voice_exempt without reason"; echo "$out" | sed 's/^/     /'; fi

# 12. only the newer post is reported; older posts are never checked
d="$(new_dir newer)"
post "$d" older 2026-11-02 "$GOOD_BODY

## One

a

## Two

b

## Three

c

## Four

d

## Same end

e"
post "$d" newer 2026-11-09 "$GOOD_BODY

## One

a

## Two

b

## Three

c

## Four

d

## Same end

e"
out="$(run "$d")"
if echo "$out" | grep -q 'WARN .*newer.md' && ! echo "$out" | grep -q 'WARN [^:]*older.md:'; then ok "only the newer post is reported"; else bad "newer-only report"; echo "$out" | sed 's/^/     /'; fi
d="$(new_dir oldpost)"
post "$d" old 2026-10-30 "That was the annoying part — really. **a** **b** **c**"
if run "$d" | grep -q '^WARN'; then bad "post dated before 2026-11-01 was checked"; else ok "posts dated before 2026-11-01 are exempt"; fi

# 13. warning mode exits 0 on findings; VOICE_STRICT=1 exits 1
d="$(new_dir exit)"; post "$d" new 2026-11-10 "$GOOD_BODY

That was the annoying part."
./scripts/check-voice.sh --dir "$d" >/dev/null 2>&1; rc=$?
[ "$rc" -eq 0 ] && ok "warning mode exits 0 with findings" || bad "warning mode exited $rc"
VOICE_STRICT=1 ./scripts/check-voice.sh --dir "$d" >/dev/null 2>&1; rc=$?
[ "$rc" -eq 1 ] && ok "VOICE_STRICT=1 exits 1 with findings" || bad "strict mode exited $rc"

# 14. make check does not invoke the voice script (directly or through a prerequisite)
plan="$(make -n check 2>&1)"
if echo "$plan" | grep -qi 'voice'; then bad "make check reaches the voice check"; else ok "make check does not call the voice check"; fi
if make -n check-voice 2>&1 | grep -q 'check-voice.sh'; then ok "make check-voice runs the voice script"; else bad "make check-voice target"; fi

# 15. no push or schedule workflow calls the voice check
if grep -l 'check-voice' .github/workflows/*.yml | grep -v voice-check.yml | grep -q .; then bad "another workflow calls check-voice"; else ok "only voice-check.yml calls check-voice"; fi
if grep -q '^  pull_request:' .github/workflows/voice-check.yml && ! grep -Eq '^  (push|schedule|workflow_dispatch):' .github/workflows/voice-check.yml; then ok "voice-check.yml triggers on pull_request only"; else bad "voice-check.yml triggers"; fi

echo
if [ "$fails" -eq 0 ]; then echo "check-voice tests: all passed"; else echo "check-voice tests: $fails failed"; exit 1; fi
