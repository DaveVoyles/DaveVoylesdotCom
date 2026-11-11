#!/usr/bin/env node
// Voice check for posts dated on or after a cutoff (default 2026-11-01).
// Usage: check-voice.mjs [--dir content/posts] [--since 2026-11-01] [--phrases FILE]
// Prints one "WARN <file>: <rule>: <detail>" line per finding. Exit 0 always, unless
// VOICE_STRICT=1, which exits 1 when there is any finding (D8 turns this on).
// Rule names: score, bold, em-dash, retired-phrase, checklist-headings,
// first-sentence, final-heading, shared-headings.
// A post opts out with front matter: voice_exempt = ["bold"] plus voice_exempt_reason = "why".
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from './scripts/tells.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const DIR = arg('--dir', 'content/posts');
const SINCE = arg('--since', '2026-11-01');
const PHRASES = arg('--phrases', join(HERE, 'retired-phrases.txt'));

const SCORE_LIMIT = 20;
const WORDS_PER_BOLD = 120;
const CHECKLIST = ['in brief', 'situation', 'why it matters', 'decision', 'system model', 'implementation detail', 'failure modes', 'put it into practice', 'next in the system'];
const RULES = ['score', 'bold', 'em-dash', 'retired-phrase', 'checklist-headings', 'first-sentence', 'final-heading', 'shared-headings'];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md') && !name.startsWith('_index')) out.push(p);
  }
  return out;
}

function splitFront(src) {
  const m = src.replace(/^﻿/, '').match(/^(\+\+\+|---)\r?\n([\s\S]*?)\r?\n\1[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  return m ? { front: m[2], body: m[3] } : { front: '', body: src };
}

function frontValue(front, key) {
  const m = front.match(new RegExp(`^${key}\\s*[=:]\\s*(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

// Remove fenced code, inline code and block quotes, in that order.
function strip(body) {
  const lines = body.split(/\r?\n/);
  const kept = [];
  let fence = null;
  for (const line of lines) {
    const f = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length) fence = null;
      continue;
    }
    if (f) { fence = f[1]; continue; }
    if (/^\s{0,3}>/.test(line)) continue;
    kept.push(line);
  }
  return kept.join('\n').replace(/(`+)[^`\n]*?\1/g, '');
}

const norm = (s) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

function h2s(text) {
  return [...text.matchAll(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)].map((m) => norm(m[1]));
}

function firstSentence(text) {
  for (const raw of text.split(/\n\s*\n/)) {
    const para = raw.trim();
    if (!para || /^(#|\{\{|<|!\[|\||---|\+\+\+|[-*+] |\d+\. )/.test(para)) continue;
    const flat = para.replace(/\s+/g, ' ').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
    const m = flat.match(/^.+?[.!?](?=\s|$)/);
    return norm(m ? m[0] : flat);
  }
  return '';
}

function loadPhrases(file) {
  return readFileSync(file, 'utf8').split(/\r?\n/)
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const m = l.match(/^(.*?)\s*\{max=(\d+)\}$/);
      return { phrase: norm(m ? m[1] : l), max: m ? Number(m[2]) : 0 };
    });
}

function countOf(hay, needle) {
  let n = 0, i = 0;
  while ((i = hay.indexOf(needle, i)) > -1) { n++; i += needle.length; }
  return n;
}

function parseDate(v) {
  const m = (v || '').match(/(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?)(Z|[+-]\d{2}:?\d{2})?)?/);
  if (!m) return null;
  const t = Date.parse(`${m[1]}T${m[2] || '00:00'}${m[2] && m[2].length === 5 ? ':00' : ''}${m[3] ? (m[3] === 'Z' ? 'Z' : m[3].replace(/^([+-]\d{2})(\d{2})$/, '$1:$2')) : 'Z'}`);
  return { day: m[1], t: Number.isNaN(t) ? Date.parse(`${m[1]}T00:00:00Z`) : t };
}

const phrases = loadPhrases(PHRASES);
const posts = walk(DIR).map((file) => {
  const src = readFileSync(file, 'utf8');
  const { front, body } = splitFront(src);
  const date = parseDate(frontValue(front, 'date'));
  const text = strip(body);
  const exemptRaw = frontValue(front, 'voice_exempt');
  const exempt = exemptRaw ? [...exemptRaw.matchAll(/[A-Za-z][A-Za-z-]*/g)].map((m) => m[0]).filter((r) => RULES.includes(r)) : [];
  const reason = (frontValue(front, 'voice_exempt_reason') || '').replace(/^["']|["']$/g, '').trim();
  const heads = h2s(text);
  return { file, date, text, heads, first: firstSentence(text), last: heads[heads.length - 1] || '', exempt, reason, hasExempt: exemptRaw !== null };
}).filter((p) => p.date).sort((a, b) => a.date.t - b.date.t || a.file.localeCompare(b.file));

let findings = 0;
posts.forEach((p, idx) => {
  if (p.date.day < SINCE) return;
  const out = [];
  const add = (rule, detail) => out.push({ rule, detail });

  const r = scan(p.text, 'md');
  if (r.score >= SCORE_LIMIT) add('score', `tells score ${r.score} (limit is under ${SCORE_LIMIT})`);

  const prose = p.text.replace(/^#{1,6}[ \t].*$/gm, '');
  const words = (prose.match(/\S+/g) || []).length;
  const bold = (prose.match(/\*\*[^*\n]+?\*\*|__[^_\n]+?__/g) || []).length;
  const allowed = Math.max(1, Math.floor(words / WORDS_PER_BOLD));
  if (bold > allowed) add('bold', `${bold} bold spans in ${words} words (budget ${allowed})`);

  const dashes = (p.text.match(/—/g) || []).length;
  if (dashes) add('em-dash', `${dashes} em dash${dashes > 1 ? 'es' : ''}`);

  const flat = norm(p.text);
  for (const { phrase, max } of phrases) {
    const n = countOf(flat, phrase);
    if (n > max) add('retired-phrase', `"${phrase}" used ${n} time${n > 1 ? 's' : ''}${max ? ` (allowed ${max})` : ''}`);
  }

  const listed = p.heads.filter((h) => CHECKLIST.includes(h));
  if (listed.length >= 4) add('checklist-headings', `${listed.length} headings copy the checklist: ${listed.join(', ')}`);

  for (const q of posts.slice(Math.max(0, idx - 3), idx)) {
    const q_name = relative(DIR, q.file);
    if (p.first && p.first === q.first) add('first-sentence', `same first sentence as ${q_name}`);
    if (p.last && p.last === q.last) add('final-heading', `same final heading as ${q_name}: "${p.last}"`);
    const shared = [...new Set(p.heads)].filter((h) => q.heads.includes(h));
    if (shared.length > 3) add('shared-headings', `${shared.length} headings shared with ${q_name}: ${shared.join(', ')}`);
  }

  let skip = new Set();
  if (p.hasExempt && !p.reason) add('voice_exempt', 'voice_exempt needs a voice_exempt_reason; exemption ignored');
  else skip = new Set(p.exempt);
  for (const f of out) {
    if (skip.has(f.rule)) continue;
    findings++;
    console.log(`WARN ${p.file}: ${f.rule}: ${f.detail}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${p.file}::voice check ${f.rule}: ${f.detail}`);
  }
});

const checked = posts.filter((p) => p.date.day >= SINCE).length;
console.log(`voice check: ${checked} post(s) dated ${SINCE} or later, ${findings} finding(s)${process.env.VOICE_STRICT === '1' ? '' : ' (warning mode, exit 0)'}`);
process.exit(process.env.VOICE_STRICT === '1' && findings ? 1 : 0);
