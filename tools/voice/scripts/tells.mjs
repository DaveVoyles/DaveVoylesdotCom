#!/usr/bin/env node
// Deterministic AI-tell scanner. Usage: tells.mjs <file> [--threshold N] [--mode html|md]
// Prints JSON {score, threshold, pass, metrics, flags[]}. Score 0-100, higher = more machine-written.
// Exit 0 when score < threshold, else 1.
// The detectors mirror a subset of voice/references/humanizer.md (the full catalogue lives there, not here):
//   PHRASES not-x-but-y, not-just, staged-runup  -> A.1, A.4, A.5   | triads -> B.6 | repeated-opener -> B.7
//   em dashes -> B.8 | stacked-hedge, HEDGES -> B.9 | STOCK -> C.12 | inflated-significance -> C.13
//   ing-rider -> C.15 | sales -> C.16 | weasel -> C.17 | serves-as -> C.18 | chatbot-residue -> E.22
//   dramatic-fragment -> A.2 | low-specificity and the flat-spot read are this skill's own (references/passes.md).
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { proseText, sentences, modeFor } from './segments.mjs';

const STOCK = ['delve', 'tapestry', 'testament', 'landscape', 'pivotal', 'crucial', 'robust', 'seamless', 'seamlessly', 'cutting-edge', 'game-changer', 'game-changing', 'unlock', 'unleash', 'elevate', 'empower', 'showcase', 'underscore', 'vibrant', 'meticulous', 'meticulously', 'intricate', 'journey', 'next-level', 'revolutionary', 'additionally', 'leverage', 'streamline', 'holistic', 'synergy', 'transformative', 'comprehensive', 'ever-evolving', 'fast-paced', 'realm', 'beacon', 'foster', 'harness', 'navigate', 'myriad', 'plethora', 'paramount', 'groundbreaking', 'state-of-the-art', 'world-class', 'best-in-class', 'end-to-end', 'scalable', 'actionable', 'ecosystem'];
const PHRASES = [
  ['not-x-but-y', /\b(?:it'?s|this is|that'?s|is|are) not (?:just|only|merely|simply)\b[^.]{0,80}?(?:,|;|—|–|-)\s*(?:it'?s|but|it is|they'?re)\b/gi],
  ['not-just', /\bnot just\b[^.]{0,60}\bbut\b/gi],
  ['staged-runup', /\b(?:here'?s the thing|let'?s be honest|let that sink in|the truth is|the reality is|make no mistake|here'?s the kicker)\b/gi],
  ['signposting', /\b(?:let'?s dive in|dive into|dive deep|in this (?:section|article|post|document)|we will (?:explore|discuss|cover)|without further ado|buckle up)\b/gi],
  ['fake-candid', /(?:^|[.!?]\s+)(?:honestly|frankly|to be frank|to be honest|candidly)\b/gi],
  ['inflated-significance', /\b(?:marks a (?:pivotal|significant|new) |stands as a testament|serves as a (?:testament|reminder|beacon)|plays a (?:key|vital|crucial|pivotal|significant) role|at the heart of|at its core|the real question)\b/gi],
  ['ing-rider', /,\s+(?:highlighting|underscoring|showcasing|demonstrating|reflecting|emphasizing|ensuring|enabling|allowing|empowering|fostering|paving)\b[^.]{0,60}/gi],
  ['filler', /\b(?:in order to|due to the fact that|it is (?:important|worth) (?:to note|noting) that|it should be noted|at this point in time|in today'?s (?:fast-paced|digital|modern|ever)[\w -]*|when it comes to|in the world of|the fact that)\b/gi],
  ['chatbot-residue', /\b(?:i hope this helps|let me know if|feel free to|as an ai|certainly!|great question|happy to help|i'?d be happy)\b/gi],
  ['generic-conclusion', /\b(?:the future (?:looks|is) bright|only time will tell|exciting (?:times|possibilities) ahead|the possibilities are endless|sky'?s the limit)\b/gi],
  ['weasel', /\b(?:experts (?:say|agree)|studies (?:show|suggest)|many (?:believe|say)|it is widely (?:known|believed)|industry leaders)\b/gi],
  ['sales', /\b(?:take (?:it|your \w+) to the next level|supercharge|turbocharge|revolutionize|transform the way|one-stop|all-in-one|unlock the (?:power|potential)|whether you'?re a)\b/gi],
  ['corporate-boilerplate', /\b(?:i hope this (?:message|email|note) finds you well|take a moment to|please note that|(?:do not|don'?t) hesitate to|remain committed to|moving forward|going forward|key (?:updates|takeaways)|ongoing initiatives|cross-functional|best practices|circle back|touch base|reach out|sustainable growth|drive alignment|deliver value)\b/gi],
  ['stacked-hedge', /\b(?:may|might|could|can) (?:potentially|possibly|perhaps)\b|\bpotentially (?:could|may|might)\b/gi],
  ['serves-as', /\b(?:serves as|stands as|acts as a|boasts|features a)\b/gi],
  ['imperative-order', /(?:^|[.!?]\s+)(?:Do not|Don'?t|Never|Always|Must)\b/g],
];
const HEDGES = ['may', 'might', 'could', 'perhaps', 'possibly', 'potentially', 'arguably', 'generally', 'typically', 'often', 'somewhat', 'relatively', 'fairly', 'quite', 'very', 'really', 'essentially', 'basically', 'ultimately', 'simply', 'just'];

const words = (s) => s.toLowerCase().match(/[a-z][a-z'-]*/g) || [];

export function scan(src, mode) {
  const text = proseText(src, mode);
  const sents = sentences(text);
  // Rhythm checks use running prose only: list items and table cells are reference text, not sentences.
  const psents = sentences(proseText(src, mode, { skipLists: true }));
  const w = words(text);
  const n = Math.max(w.length, 1);
  const flags = [];
  const per100 = (c) => (c / n) * 100;

  let phraseHits = 0;
  let orders = 0; // Do not / Never / Always openers: rules notes are full of them, so they are flagged but capped
  for (const [id, re] of PHRASES) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      if (id === 'imperative-order') orders++;
      else phraseHits++;
      flags.push({ kind: id, span: m[0].trim() });
    }
  }
  const stockHits = w.filter((x) => STOCK.includes(x));
  for (const s of new Set(stockHits)) flags.push({ kind: 'stock-word', span: s, count: stockHits.filter((x) => x === s).length });
  const hedgeCount = w.filter((x) => HEDGES.includes(x)).length;
  const dashes = (text.match(/—/g) || []).length + (text.match(/ -- /g) || []).length;
  const triads = [...text.matchAll(/\b[\w'-]+(?: [\w'-]+)?, [\w'-]+(?: [\w'-]+)?,? (?:and|or) [\w'-]+(?: [\w'-]+)?\b/g)];
  for (const t of triads) flags.push({ kind: 'rule-of-three', span: t[0] });

  const lens = psents.map((s) => s.split(/\s+/).length);
  const mean = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(lens.length, 1));
  const cv = mean ? sd / mean : 0;

  const oc = {};
  for (const s of psents) {
    const o = (s.toLowerCase().match(/[a-z']+/) || [''])[0];
    oc[o] = (oc[o] || 0) + 1;
  }
  const repeats = psents.length < 5 ? [] : Object.entries(oc).filter(([o, c]) => c >= 3 && c / psents.length >= 0.25 && !['never', 'always', "don't", 'dont', 'do', 'must'].includes(o)); // rule openers are capped under imperative-order
  for (const [o, c] of repeats) flags.push({ kind: 'repeated-opener', span: o, count: c });

  const shortS = psents.length >= 5 ? psents.filter((s) => s.split(/\s+/).length <= 4 && /[.!]$/.test(s)) : [];
  const frags = shortS.length >= 2 && shortS.length / psents.length >= 0.15 ? shortS : [];
  if (frags.length >= 2) for (const f of frags) flags.push({ kind: 'dramatic-fragment', span: f });

  const specific = psents.filter((s) => /\d|"|\b[A-Z][a-z]+\b/.test(s.replace(/^\W*\w+/, ''))).length;
  const specificity = psents.length ? specific / psents.length : 1;
  if (psents.length >= 4 && specificity < 0.5) flags.push({ kind: 'low-specificity', span: `only ${specific} of ${psents.length} sentences carry a number, name or quote` });

  const metrics = {
    words: w.length,
    sentences: sents.length,
    sentenceLengthMean: +mean.toFixed(1),
    sentenceLengthCV: +cv.toFixed(2),
    phrasePer100: +per100(phraseHits).toFixed(2),
    stockPer100: +per100(stockHits.length).toFixed(2),
    hedgePer100: +per100(hedgeCount).toFixed(2),
    emDashes: dashes,
    emDashPer100: +per100(dashes).toFixed(2),
    triads: triads.length,
    repeatedOpeners: repeats.length,
    fragments: frags.length,
    specificity: +specificity.toFixed(2),
  };
  const clamp = (x, hi) => Math.min(Math.max(x, 0), hi);
  const score = Math.round(
    clamp(metrics.phrasePer100 * 10, 30) +
      clamp(orders * 1.5, 6) +
      clamp(metrics.stockPer100 * 7, 25) +
      clamp((metrics.hedgePer100 - 1.5) * 4, 8) +
      clamp(metrics.emDashPer100 * 4, 8) +
      clamp(triads.length * 3, 9) +
      clamp(repeats.length * 4, 8) +
      (psents.length >= 5 ? clamp((0.45 - cv) * 30, 8) : 0) +
      (frags.length >= 2 ? clamp(frags.length * 2, 6) : 0) +
      (psents.length >= 4 ? clamp((0.6 - specificity) * 15, 6) : 0),
  );
  return { score: Math.min(score, 100), metrics, flags };
}

function main() {
  const a = process.argv.slice(2);
  const opt = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
  const file = a.find((x, i) => !x.startsWith('--') && !['--threshold', '--mode'].includes(a[i - 1]));
  if (!file) {
    console.error('usage: tells.mjs <file> [--threshold N] [--mode html|md]');
    process.exit(2);
  }
  const threshold = Number(opt('--threshold', 20));
  const src = readFileSync(file, 'utf8');
  const r = scan(src, opt('--mode') || modeFor(src, file));
  const out = { file, threshold, pass: r.score < threshold, ...r };
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}
let isMain = false;
try {
  isMain = realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
} catch {}
if (isMain) main();
