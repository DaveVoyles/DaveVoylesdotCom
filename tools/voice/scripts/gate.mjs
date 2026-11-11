// Token-stream equivalence gate, backed by the vendored markdown-it (independent of the extractor in segments.mjs).
//   parseTokens(src, pick)           -> flat list of comparable token rows, line-tagged
//   equivalent(before, after, free)  -> { ok: true } | { ok: false, reason, index, line, before, after }
// Everything is compared: token type, tag, markup, info, attrs (link hrefs and titles, image src), level, block flag,
// the content of fence, code_block, code_inline, html_block, html_inline, image and text, plus the link reference
// definitions (markdown-it keeps them in env.references, not as tokens). The only exception is the text and soft breaks
// of the `free` paragraphs, the ones textnodes offered for rewriting.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const VENDOR = join(dirname(fileURLToPath(import.meta.url)), '..', 'vendor', 'markdown-it.min.cjs');
export const PINNED_SHA256 = '38c70a1e7ca91ab40e2d9e6e60129851a717ed1c7d4acbbdd41bf9503791cf68';

let md = null;
function parser() {
  if (md) return md;
  const sha = createHash('sha256').update(readFileSync(VENDOR)).digest('hex');
  if (sha !== PINNED_SHA256) throw new Error(`vendored markdown-it does not match its pinned sha256 (got ${sha}); refusing to use it`);
  const MarkdownIt = createRequire(import.meta.url)(VENDOR);
  md = new MarkdownIt('commonmark', { html: true, linkify: false }).enable(['table', 'strikethrough']);
  return md;
}
export const parserVersion = () => '14.1.0';

const CONTENT = new Set(['fence', 'code_block', 'html_block', 'code_inline', 'html_inline', 'image', 'text']);

export function parse(src) {
  const env = {};
  return { tokens: parser().parse(src, env), env };
}

// Indices of top-level inline tokens that are plain prose (only text and soft breaks) in a paragraph.
export const plainSet = (tokens) => new Set(tokens.flatMap((t, i) => (t.type === 'inline' && tokens[i - 1].type === 'paragraph_open' && (t.children || []).every((c) => c.type === 'text' || c.type === 'softbreak') ? [i] : [])));

// `free` holds the inline tokens whose text may change: their text and soft breaks are skipped. Every other token,
// including the text of every other paragraph, heading, link and cell, is compared by content.
function rows(tokens, out, line, free, inFree) {
  tokens.forEach((t, i) => {
    if (inFree && (t.type === 'text' || t.type === 'softbreak')) return;
    const at = t.map ? t.map[0] + 1 : line;
    const attrs = (t.attrs || []).map(([k, v]) => `${k}=${v}`).sort().join('&');
    out.push({ line: at, row: [t.type, t.tag, t.markup, t.info, attrs, t.level, t.block, t.hidden, CONTENT.has(t.type) ? t.content : ''].join('\u0001') });
    if (t.type === 'inline' && t.children) rows(t.children, out, at, null, Boolean(free?.has(i)));
  });
  return out;
}

export function parseTokens(src, pick = () => new Set()) {
  const { tokens, env } = parse(src);
  const out = rows(tokens, [], 1, pick(tokens), false);
  const refs = Object.entries(env.references || {})
    .map(([k, v]) => `${k}\u0001${v.href}\u0001${v.title}`)
    .sort();
  for (const r of refs) out.push({ line: 0, row: `ref\u0001${r}` });
  return out;
}

export function diffRows(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (!a[i] || !b[i] || a[i].row !== b[i].row) {
      return {
        ok: false,
        reason: 'the parsed structure changed outside plain text',
        index: i,
        line: (a[i] || b[i]).line,
        before: a[i] ? a[i].row.split('\u0001').join(' | ') : '(end)',
        after: b[i] ? b[i].row.split('\u0001').join(' | ') : '(end)',
      };
    }
  }
  return { ok: true };
}

// `free`: Set of top-level inline token indices (the offered paragraphs) whose text may differ.
export function equivalent(before, after, free = new Set()) {
  try {
    return diffRows(parseTokens(before, () => free), parseTokens(after, () => free));
  } catch (e) {
    return { ok: false, reason: `parse failed: ${e.message}`, index: -1, line: 0 };
  }
}

export const describe = (r) => `${r.reason}${r.line ? ` near line ${r.line}` : ''}: before [${(r.before || '').slice(0, 160)}] after [${(r.after || '').slice(0, 160)}]`;
