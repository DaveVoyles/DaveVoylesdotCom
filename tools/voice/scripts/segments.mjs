// Shared: split a document into rewritable prose units, masking everything that is markup or code.
//
// HTML: text nodes only. Doctype, CDATA, comments, processing instructions and tags (attributes parsed with quotes)
// are markup; headings and the contents of script, style, textarea, pre, code, kbd, samp and svg are never exposed.
// Character entities and inline math are masked.
//
// Markdown: markdown-it finds plain-prose paragraphs; everything else is declined (see mdUnits). The extractor may be
// sloppy because textnodes apply re-parses and refuses any write that changes more than plain text (gate.mjs).
import { parse } from './gate.mjs';

export function modeFor(src, file = '') {
  if (/\.(md|markdown|mdx|txt)$/i.test(file)) return 'md';
  if (/\.(html?|xhtml)$/i.test(file)) return 'html';
  return /^\s*(<!doctype\b|<html\b|<\?xml\b|<head\b|<body\b)/i.test(src) ? 'html' : 'md';
}

const ENTITY = /&(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#[xX][0-9a-fA-F]+);/g;
const MATH = /\$\$[^$\n]+\$\$|(?<![\w$\\])\$(?=\S)[^$\n]*?\S\$(?![\w$])/g;
const RAW = new Set(['script', 'style', 'textarea']); // content skipped up to the closing tag
const SKIP = new Set(['pre', 'code', 'svg', 'kbd', 'samp', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']); // skipped by depth
const LISTY = new Set(['li', 'td', 'th', 'dt', 'dd']);
const TOKEN = /<!--|<!\[CDATA\[|<![^>]*>|<\?|<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

// Runs of text not covered by any of the regexes, as [start, end] offsets inside text.
function maskRuns(text, regs) {
  const mask = new Uint8Array(text.length);
  for (const re of regs) for (const m of text.matchAll(re)) mask.fill(1, m.index, m.index + m[0].length);
  const runs = [];
  let i = 0;
  while (i < text.length) {
    if (mask[i] || text[i] === '\n') {
      i++;
      continue;
    }
    let j = i;
    while (j < text.length && !mask[j] && text[j] !== '\n') j++;
    runs.push([i, j]);
    i = j;
  }
  return runs;
}

function splitSpans(spans) {
  const out = [];
  for (const s of spans) {
    for (const [a, b] of maskRuns(s.text, [ENTITY, MATH])) {
      const t = s.text.slice(a, b);
      if (/[A-Za-z0-9]/.test(t)) out.push({ ...s, start: s.start + a, end: s.start + b, text: t });
    }
  }
  return out;
}

function htmlSpans(src) {
  const spans = [];
  const re = new RegExp(TOKEN.source, 'g');
  let last = 0;
  let m;
  let list = 0;
  const stack = [];
  const push = (a, b) => {
    if (b > a && !stack.length) {
      const t = src.slice(a, b);
      if (/[A-Za-z0-9]/.test(t)) spans.push({ start: a, end: b, text: t, list: list > 0 });
    }
  };
  const jump = (close, from) => {
    const i = src.indexOf(close, from);
    return i < 0 ? src.length : i + close.length;
  };
  while ((m = re.exec(src))) {
    push(last, m.index);
    let end = m.index + m[0].length;
    if (m[0] === '<!--') end = jump('-->', end);
    else if (m[0] === '<![CDATA[') end = jump(']]>', end);
    else if (m[0] === '<?') end = jump('?>', end);
    else if (m[2]) {
      const name = m[2].toLowerCase();
      if (RAW.has(name) && !m[1]) {
        const close = src.slice(end).search(new RegExp(`</${name}\\s*>`, 'i'));
        end = close < 0 ? src.length : end + close + src.slice(end + close).match(/^<\/[^>]*>/)[0].length;
      } else if (SKIP.has(name)) {
        if (m[1]) {
          const i = stack.lastIndexOf(name);
          if (i >= 0) stack.length = i;
        } else if (!/\/$/.test(m[3])) stack.push(name);
      } else if (LISTY.has(name)) list = m[1] ? Math.max(0, list - 1) : list + 1;
      else if (m[1] && /^(ul|ol|table|tr|dl)$/.test(name)) list = 0;
    }
    last = end;
    re.lastIndex = end;
  }
  push(last, src.length);
  return splitSpans(spans);
}

// ---- Markdown ----
// A unit is a paragraph whose inline children are only plain text and soft breaks. Its source lines come from the block
// token's line map; the container prefix (quote markers, list markers, indentation) is split off by one small rule: it
// may hold only spaces, tabs, '>' and list markers. Anything else is declined with a reason.
const PREFIX = /^[ \t>]*(?:(?:[-+*]|\d{1,9}[.)])[ \t]+[ \t>]*)*$/;
const KIND = { link_open: 'a link', code_inline: 'inline code', em_open: 'emphasis', strong_open: 'emphasis', s_open: 'strikethrough', image: 'an image', html_inline: 'inline html', hardbreak: 'a hard line break' };

function frontEnd(lines) {
  return /^---[ \t]*\r?$/.test(lines[0]) ? lines.findIndex((l, i) => i > 0 && /^(---|\.\.\.)[ \t]*\r?$/.test(l)) : -1;
}

function mdUnits(src) {
  const { tokens } = parse(src);
  const lines = src.split('\n');
  const starts = [];
  lines.reduce((o, l) => (starts.push(o), o + l.length + 1), 0);
  const front = frontEnd(lines);
  const spans = [];
  const declined = [];
  const stats = { paragraphs: 0, words: 0, offeredWords: 0 };
  const poisoned = new Set();
  // Poison the lines from `from` to the next blank line, or (with `until`) through the first line matching it.
  const poison = (from, until) => {
    for (let j = from; j < lines.length && (until || lines[j].trim()); j++) {
      poisoned.add(j);
      if (until && until.test(lines[j])) break;
    }
  };
  const BLOCK = { heading_open: 'heading', table_open: 'table', fence: 'code fence', code_block: 'indented code', html_block: 'HTML block' };
  tokens.forEach((t, i) => {
    if (BLOCK[t.type] && t.map) declined.push({ kind: 'block', line: t.map[0] + 1, reason: `${BLOCK[t.type]} (never rewritten)`, text: lines[t.map[0]].trim().slice(0, 80) });
    // A code or HTML block that did not end by its own closing line (a fence cut off by dedenting out of its list
    // item, say) is read differently by other parsers: the lines right after it are left alone. markdown-it ends a
    // comment, script, pre, style or textarea block at a blank line inside a list item; CommonMark runs it to its end
    // marker, so everything up to that marker is left alone.
    if (/^(?:fence|html_block|code_block)$/.test(t.type) && t.map) {
      const closer = t.type === 'fence' && t.map[1] - t.map[0] > 1 && new RegExp(`^[ \\t>]*(?:[-+*]|\\d{1,9}[.)])?[ \\t>]*[${t.markup[0]}]{${t.markup.length},}\\s*$`).test(lines[t.map[1] - 1]);
      const end = t.type === 'html_block' && HTML_END.find(([open]) => open.test(t.content.trimStart()));
      if (end) {
        if (!end[1].test(t.content)) poison(t.map[1], end[1]);
      } else if (!closer) poison(t.map[1]);
    }
    if (/^(?:th|td|heading)_open$/.test(t.type) && tokens[i + 1].type === 'inline') stats.words += tokens[i + 1].content.split(/\s+/).filter(Boolean).length;
    if (t.type !== 'inline' || tokens[i - 1].type !== 'paragraph_open') return;
    stats.paragraphs++;
    stats.words += t.content.split(/\s+/).filter(Boolean).length;
    const [m0, m1] = t.map;
    const no = (reason) => declined.push({ kind: 'paragraph', line: m0 + 1, reason, text: lines[m0].trim().slice(0, 80) });
    const kids = t.children || [];
    const bad = kids.find((c) => c.type !== 'text' && c.type !== 'softbreak');
    const want = t.content.split('\n').map((l) => l.trim());
    // markdown-it reads an unindented "<tag" line after a list item as a lazy continuation; the CommonMark reference
    // implementations start an HTML block there, which would swallow the lines up to the next blank line.
    want.forEach((w, k) => {
      if (k && /^<[A-Za-z/!?]/.test(w)) poison(m0 + k);
    });
    // commonmark.py has no tables: a paragraph touching a table would run on into its rows there.
    if (tokens.some((x) => x.type === 'table_open' && x.map[0] === m1)) return no('sits directly above a table');
    if (poisoned.has(m0)) return no('follows a line that some parsers read as an HTML block or a code fence');
    if (want.some((w) => /^(?:-->|\?>|\]\]>|<\/(?:script|pre|style|textarea)\b)/i.test(w))) return no('has a line that ends an HTML block');
    if (m0 <= front) return no('front matter');
    if (bad) return no(`contains ${KIND[bad.type] || bad.type}`);
    if (kids.map((c) => (c.type === 'text' ? c.content : '\n')).join('') !== want.join('\n')) return no('contains an escape or an entity');
    if (/\[\[|\[\^|\$[^$\n]*\$|^\s*:/m.test(t.content)) return no('wiki link, footnote, math or definition list');
    if (want.some((w) => /^(?:=+|-+)$/.test(w))) return no('has a line that looks like a heading underline');
    if (want.length !== m1 - m0 || /\r(?!\n)/.test(src)) return no('cannot place the lines in the source');
    const prefixes = want.map((w, k) => {
      const line = lines[m0 + k].replace(/\s+$/, '');
      return line.endsWith(w) ? line.slice(0, line.length - w.length) : null;
    });
    if (prefixes.some((p) => p === null || !PREFIX.test(p))) return no('cannot place the lines in the source');
    if (prefixes.some((p) => /(?:[-+*]|\d[.)])\t/.test(p))) return no('a tab follows a list marker (parsers disagree on tab stops)');
    if (prefixes.some((p) => /^ {4,}>|> {4,}>/.test(p))) return no('a quote marker is indented 4 or more spaces (CommonMark reads code)');
    if (prefixes.slice(1).some((p) => p.includes('>') && p.length < prefixes[0].length)) return no('a quote marker is indented less than the line above it');
    if (prefixes.slice(2).some((p) => p !== prefixes[1])) return no('continuation lines have different prefixes');
    const end = starts[m1 - 1] + lines[m1 - 1].replace(/\s+$/, '').length;
    spans.push({ start: starts[m0] + prefixes[0].length, end, text: want.join('\n'), prefix: prefixes[1] ?? '', tok: i });
    stats.offeredWords += t.content.split(/\s+/).filter(Boolean).length;
  });
  declined.sort((a, b) => a.line - b.line);
  return { spans, declined, stats };
}

// Start and end markers of CommonMark HTML blocks that run past blank lines (types 1 to 5).
const HTML_END = [
  [/^<!--/, /-->/],
  [/^<\?/, /\?>/],
  [/^<!\[CDATA\[/, /\]\]>/],
  [/^<![A-Za-z]/, />/],
  [/^<(?:script|pre|style|textarea)(?:\s|>|$)/i, /<\/(?:script|pre|style|textarea)>/i],
];

// What textnodes.mjs offers: {spans, declined, stats}. `declined` lists what is left alone and why (author review):
// paragraphs with a reason, plus headings, tables, fences, indented code and HTML blocks, which are never rewritten.
export function offered(src, mode = modeFor(src)) {
  return mode === 'html' ? { spans: htmlSpans(src), declined: [], stats: null } : mdUnits(src);
}
export const declined = (src, mode) => offered(src, mode).declined;

// HTML: everything that is not a rewritable text node (the byte-for-byte part).
export function skeleton(src) {
  let out = '';
  let pos = 0;
  for (const s of htmlSpans(src)) {
    out += src.slice(pos, s.start) + '\u0000';
    pos = s.end;
  }
  return out + src.slice(pos);
}

// Markdown prose for scanning: every paragraph, list item and table cell, including text inside links and emphasis.
function mdProse(src, skipLists) {
  const { tokens } = parse(src);
  const front = frontEnd(src.split('\n'));
  const out = [];
  let list = 0;
  tokens.forEach((t, i) => {
    if (/^(?:bullet_list|ordered_list|th|td)_open$/.test(t.type)) list++;
    else if (/^(?:bullet_list|ordered_list|th|td)_close$/.test(t.type)) list--;
    else if (t.type === 'inline' && /^(?:paragraph|th|td)_open$/.test(tokens[i - 1].type) && t.map?.[0] > front && !(skipLists && list > 0)) {
      out.push((t.children || []).map((c) => (c.type === 'text' ? c.content : /break/.test(c.type) ? '\n' : /^(code|html|image)/.test(c.type) ? ' ' : '')).join(''));
    }
  });
  return out.join('\n');
}

const INLINE = /^(<\/?(a|strong|em|b|i|span|small|mark|u|sup|sub|abbr|cite|q|s|del|ins)\b(?:"[^"]*"|'[^']*'|[^>"'])*>)+$/i;
const DECODE = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: "'", lsquo: "'", mdash: '—', ndash: '–' };

// Plain prose for scanning. opts.skipLists drops list items and table cells (for rhythm metrics).
export function proseText(src, mode, opts = {}) {
  const m = mode || modeFor(src);
  if (m !== 'html') return mdProse(src, opts.skipLists);
  const spans = htmlSpans(src).filter((s) => !(opts.skipLists && s.list));
  let out = '';
  spans.forEach((s, i) => {
    if (i) {
      const gap = src.slice(spans[i - 1].end, s.start);
      let glue = '\n';
      const ent = gap.match(/^&(?:([a-zA-Z]+)|#(\d+)|#[xX]([0-9a-fA-F]+));$/);
      if (ent) glue = ent[1] ? (DECODE[ent[1]] ?? ' ') : String.fromCodePoint(ent[2] ? +ent[2] : parseInt(ent[3], 16));
      else if (INLINE.test(gap)) glue = '';
      out += glue;
    }
    out += s.text;
  });
  return out;
}

export function sentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])["')\]]*\s+(?=[A-Z"'(\[])/)
    .map((s) => s.trim())
    .filter((s) => /\w/.test(s));
}
