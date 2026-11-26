/*
  Probe rows for test design items. The validator needs rows that reach every
  behavior the oracle, the mutants and the partitions distinguish, without
  knowing the spec. It scans each field while holding the others fixed, keeps
  the values on both sides of every change in behavior, and returns the
  cartesian product of the kept values.

  Number fields: integers from -5 to 200, then steps of 10 up to 10000 with
  each change refined to the integer, then each integer change refined to
  0.01 so decimal boundaries such as 49.99 are found. A few decimals and large
  negatives are always included, and '' for a blank input.
  Text fields: every string up to 7 characters over the classes
  uppercase, lowercase, digit and space; runs of one character up to 300
  long; common patterns; strings quoted in the item's own prose (backticks or
  double quotes) and every one-character edit of those. One value is kept per
  distinct behavior.
  Select and boolean fields: every value.
*/

const TEXT_SAMPLES = ['', ' ', 'a', 'abc', 'ABC', 'a b', 'abc123', '123', '-1', '1.5', 'user@example.com', '<script>'];
// '' is what TestDesignLab stores for a blank number input.
const NUMBER_SEEDS = ['', -1000, -100, -5, -1, -0.5, 0, 0.5, 1, 1.5, 10, 50, 100, 200, 10000];
const SHAPE_ALPHABET = ['A', 'a', '0', ' '];
const SHAPE_MAX = 7;
const EDIT_ALPHABET = ['A', 'Z', 'a', 'z', '0', '9', ' ', '-', '.', '@', '_', '!'];
const MAX_BASES = 400;
const MAX_TEXT_BASES = 30;
const MAX_ROWS = 300000;

function shapes() {
  const out = [''];
  let layer = [''];
  for (let n = 1; n <= SHAPE_MAX; n++) {
    layer = layer.flatMap((s) => SHAPE_ALPHABET.map((c) => s + c));
    out.push(...layer);
  }
  return out;
}

function minedStrings(item) {
  const prose = [item.prompt, item.solutionNotes, item.interviewNotes, ...(item.hints ?? [])].filter((s) => typeof s === 'string');
  const out = new Set();
  for (const text of prose) {
    for (const m of text.matchAll(/`([^`\n]{0,60})`/g)) out.add(m[1]);
    for (const m of text.matchAll(/"([^"\n]{0,60})"/g)) out.add(m[1]);
  }
  return [...out];
}

function edits(s) {
  const out = new Set([s.trim(), ` ${s}`, `${s} `]);
  for (let i = 0; i <= s.length; i++) {
    for (const c of EDIT_ALPHABET) out.add(s.slice(0, i) + c + s.slice(i));
    if (i < s.length) {
      out.add(s.slice(0, i) + s.slice(i + 1));
      for (const c of EDIT_ALPHABET) out.add(s.slice(0, i) + c + s.slice(i + 1));
      const ch = s[i];
      const flipped = ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase();
      out.add(s.slice(0, i) + flipped + s.slice(i + 1));
    }
  }
  return [...out];
}

function textCandidates(item) {
  const mined = minedStrings(item);
  const runs = [];
  for (const c of ['a', 'A', '0']) for (let n = 1; n <= 300; n++) runs.push(c.repeat(n));
  return [...new Set([...mined, ...mined.flatMap(edits), ...TEXT_SAMPLES, ...shapes(), ...runs])];
}

function cartesianSize(lists) {
  return lists.reduce((n, l) => n * l.length, 1);
}

/** All combinations, or an evenly spaced deterministic sample of at most `cap`. */
function cartesian(fields, cand, cap) {
  const lists = fields.map((f) => cand.get(f.name));
  const total = cartesianSize(lists);
  const pick = (idx) => {
    const row = {};
    let rest = idx;
    for (let i = fields.length - 1; i >= 0; i--) {
      const l = lists[i];
      row[fields[i].name] = l[rest % l.length];
      rest = Math.floor(rest / l.length);
    }
    return row;
  };
  const out = [];
  if (total <= cap) {
    for (let i = 0; i < total; i++) out.push(pick(i));
    return { rows: out, total, sampled: false };
  }
  const step = total / cap;
  for (let i = 0; i < cap; i++) out.push(pick(Math.floor(i * step)));
  return { rows: out, total, sampled: true };
}

function signatureFn(item) {
  const fns = [item.oracle, ...item.mutants.map((m) => m.fn), ...item.partitions.map((p) => p.matches)];
  return (row) =>
    fns
      .map((f) => {
        try {
          return String(f(row));
        } catch (e) {
          return `throw:${e instanceof Error ? e.message : e}`;
        }
      })
      .join('\u0001');
}

const round2 = (v) => Math.round(v * 100) / 100;

function scanNumber(sig, base, name, add) {
  const at = (v) => sig({ ...base, [name]: v });
  const refine = (lo, hi, step, onPair) => {
    let prevV = lo;
    let prevS = at(lo);
    for (let v = round2(lo + step); v <= hi + 1e-9; v = round2(v + step)) {
      const s = at(v);
      if (s !== prevS) onPair(prevV, v);
      prevV = v;
      prevS = s;
    }
  };
  const integerPair = (a, b) => {
    add(a);
    add(b);
    if (b - a === 1) refine(a, b, 0.01, (x, y) => (add(x), add(y)));
  };
  refine(-5, 200, 1, integerPair);
  refine(200, 10000, 10, (a, b) => refine(a, b, 1, integerPair));
}

/** Keeps the first value seen for each distinct behavior. */
function scanText(sig, base, name, add, pool) {
  const seen = new Set();
  for (const v of pool) {
    const s = sig({ ...base, [name]: v });
    if (!seen.has(s)) {
      seen.add(s);
      add(v);
    }
  }
}

/**
 * Returns { rows, total, sampled, perField } where perField maps each field
 * name to the values kept for it.
 */
export function buildProbeRows(item) {
  const sig = signatureFn(item);
  const fields = item.fields;
  const cand = new Map();
  const textPool = fields.some((f) => f.type === 'text') ? textCandidates(item) : [];
  for (const f of fields) {
    if (f.type === 'number') cand.set(f.name, [...NUMBER_SEEDS]);
    else if (f.type === 'text') cand.set(f.name, [...new Set([...minedStrings(item), ...TEXT_SAMPLES])]);
    else if (f.type === 'select') cand.set(f.name, [...f.options]);
    else if (f.type === 'boolean') cand.set(f.name, [true, false]);
    else cand.set(f.name, []);
  }
  const scanned = fields.filter((f) => f.type === 'number' || f.type === 'text');
  // Two rounds: the second scans each field against values the first round found for the others.
  for (let round = 0; round < 2; round++) {
    for (const f of scanned) {
      const others = fields.filter((o) => o !== f);
      const cap = f.type === 'text' ? MAX_TEXT_BASES : MAX_BASES;
      const { rows: bases } = others.length ? cartesian(others, cand, cap) : { rows: [{}] };
      const set = new Set(cand.get(f.name));
      const add = (v) => set.add(v);
      for (const base of bases) {
        if (f.type === 'number') scanNumber(sig, base, f.name, add);
        else scanText(sig, base, f.name, add, textPool);
      }
      cand.set(
        f.name,
        [...set].sort((a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).length - String(b).length || String(a).localeCompare(String(b)))),
      );
    }
  }
  const { rows, total, sampled } = cartesian(fields, cand, MAX_ROWS);
  return { rows, total, sampled, perField: Object.fromEntries(cand) };
}
