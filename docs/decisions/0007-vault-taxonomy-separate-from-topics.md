---
title: "Vault notes get their own taxonomy, separate from `topics`"
status: accepted
date: 2026-07-19
---

# 0007 — Vault notes get their own taxonomy, separate from `topics`

## Status

Accepted

## Context and Problem Statement

Plan 0004 introduces a new "Vault" content section (`content/vault/*.md`) of
short, atomic, wikilinked notes — distinct from blog posts. The site already
carries three taxonomies on posts: legacy `tags` and `categories` (see ADR
0004's additive framing), and the newer curated `topics` field (6-bucket
controlled vocabulary, driving related posts and the graph's node coloring
per plan 0002/0003). The question: should vault notes reuse the existing
`topics` taxonomy, or get their own?

## Decision Drivers

- `topics`' 6 buckets (Gaming, Tech, AI and Agents, Public Speaking and
  Presentations, Career and Students, Journalism and Marketing and PR) were
  designed to classify **blog posts** at a coarse, reader-facing level — not
  to describe atomic reference/glossary-style notes, which may cover
  concepts narrower or orthogonal to any bucket (e.g. a note on a specific
  writing technique, or a specific tool).
- Forcing every vault note into one of the 6 existing buckets risks either
  miscategorization or pressure to keep growing the `topics` vocabulary for
  a purpose it wasn't designed for.
- The vault's actual cross-linking mechanism is wikilinks (ADR 0008) and the
  backlink/graph index (ADR 0009) — the taxonomy's job here is browsability
  within the vault section, not primarily graph connectivity, which the
  wikilink mechanism already covers.

## Considered Options

1. **Reuse `topics`** — classify vault notes with the same 6-bucket field
   posts use. No new taxonomy to declare, and it plugs vault notes directly
   into the graph's existing color key.
2. **Dedicated vault taxonomy (chosen)** — a new taxonomy declared in
   `hugo.toml`, scoped to vault notes only, with its own vocabulary.
3. **No taxonomy at all** — rely entirely on wikilinks and backlinks for
   discovery, skip a browsable category structure.

## Decision Outcome

Chosen option: **dedicated vault taxonomy (option 2)**. A new taxonomy is
declared in `hugo.toml` alongside `tags`, `categories`, and `topics`,
scoped to `content/vault/*.md` notes.

### Consequences

- Good: vault notes get a classification vocabulary suited to atomic
  reference content, without distorting or diluting `topics`' 6-bucket
  design for blog posts.
- Good: the graph's post-to-post edges (plan 0003) and node coloring stay
  entirely unaffected — this taxonomy has no bearing on existing behavior.
- Bad: the site now runs **four** taxonomies (`tags`, `categories`,
  `topics`, and the new vault taxonomy) — a real increase in classification
  surface area that future contributors need to understand.
- Neutral: vault-to-post and vault-to-vault connectivity in the graph comes
  from the wikilink-derived backlink index (ADR 0009), not from shared
  taxonomy terms — this taxonomy's role is intra-vault browsability only,
  not graph edges.
