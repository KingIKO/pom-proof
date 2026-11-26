/*
  Content checks used by scripts/validate-content.mjs and its self-test.

  Each check takes a result object { failures, warnings, skipped } and an
  item, and records what is wrong with the item. Checks run the item through
  the same runners the site uses (core.ts, locators.ts, sql.js, Pyodide).
*/

import { createServer } from 'vite';
import { readFileSync, globSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { transform } from 'sucrase';
import { buildProbeRows } from './testdesign-probes.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Set python to false to skip Python reference checks (they are then reported as skipped). */
export const options = { python: true };

export const KINDS = ['coding', 'mutation', 'locator', 'sql', 'bughunt', 'testdesign', 'uilab', 'scenario', 'diagnose', 'review'];
const ROLES = ['manual', 'automation', 'sdet', 'lead'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
// Built from code points so this file stays free of the characters it looks for.
const EMOJI = new RegExp(`\\p{Extended_Pictographic}|${String.fromCodePoint(0xfe0f)}`, 'u');
const EM_DASH = new RegExp(String.fromCodePoint(0x2014));

export function makeResult(group, id, file = '') {
  return { group, id, file, failures: [], warnings: [], skipped: [] };
}
function fail(r, msg) {
  r.failures.push(msg);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function codePoint(ch) {
  return 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}

/** Flags emoji and em dashes in user-facing prose. `fields` is [label, value][] with string or string[] values. */
function checkProse(r, fields) {
  for (const [label, value] of fields) {
    const list = Array.isArray(value) ? value : [value];
    list.forEach((s, i) => {
      if (typeof s !== 'string') return;
      const where = Array.isArray(value) ? `${label}[${i}]` : label;
      const e = s.match(EMOJI);
      if (e) fail(r, `${where} contains an emoji (${codePoint(e[0])}) near "${excerpt(s, e.index)}"`);
      const d = s.match(EM_DASH);
      if (d) fail(r, `${where} contains an em dash near "${excerpt(s, d.index)}"`);
    });
  }
}

function excerpt(s, at) {
  return s
    .slice(Math.max(0, at - 25), at + 25)
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueIds(r, list, label) {
  const seen = new Set();
  for (const x of list ?? []) {
    if (!isNonEmptyString(x?.id)) fail(r, `${label} entry without an id`);
    else if (seen.has(x.id)) fail(r, `${label} id "${x.id}" is duplicated`);
    else seen.add(x.id);
  }
}

/* ---------------- load content through Vite ---------------- */

export async function loadModules() {
  const server = await createServer({
    root: ROOT,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const content = await server.ssrLoadModule('/src/content/index.ts');
    const types = await server.ssrLoadModule('/src/content/types.ts');
    const core = await server.ssrLoadModule('/src/runners/core.ts');
    const locators = await server.ssrLoadModule('/src/runners/locators.ts');
    const datasets = await server.ssrLoadModule('/src/content/sql/datasets.ts');
    const client = await server.ssrLoadModule('/src/runners/client.ts');
    // Per-file loads give the filename for each item, which the registry does not keep.
    const files = globSync('src/content/items/**/*.ts', { cwd: ROOT }).map((f) => f.split(path.sep).join('/')).sort();
    const itemFiles = [];
    for (const f of files) {
      let mod;
      let error;
      try {
        mod = await server.ssrLoadModule('/' + f);
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      itemFiles.push({ file: f, item: mod?.default, error });
    }
    return { content, types, core, locators, datasets, client, itemFiles };
  } finally {
    await server.close();
  }
}

/* ---------------- shared item checks ---------------- */

function checkBase(r, item, file) {
  const parts = file.split('/');
  const folderKind = parts[parts.length - 2];
  const base = parts[parts.length - 1].replace(/\.ts$/, '');
  if (item.id !== base) fail(r, `id "${item.id}" does not match its filename "${base}.ts"`);
  if (!KINDS.includes(item.kind)) fail(r, `kind "${item.kind}" is not a known kind`);
  else if (item.kind !== folderKind) fail(r, `kind "${item.kind}" is filed under items/${folderKind}/`);
  for (const k of ['id', 'title', 'summary', 'prompt']) if (!isNonEmptyString(item[k])) fail(r, `missing or empty ${k}`);
  if (!DIFFICULTIES.includes(item.difficulty)) fail(r, `difficulty "${item.difficulty}" is not one of ${DIFFICULTIES.join(', ')}`);
  if (!Array.isArray(item.topics) || item.topics.length === 0 || !item.topics.every(isNonEmptyString)) fail(r, 'topics must be a non-empty list of strings');
  if (!Array.isArray(item.roles) || item.roles.length === 0) fail(r, 'roles must be a non-empty list');
  else for (const role of item.roles) if (!ROLES.includes(role)) fail(r, `role "${role}" is not one of ${ROLES.join(', ')}`);
  if (item.hints !== undefined && (!Array.isArray(item.hints) || !item.hints.every(isNonEmptyString))) fail(r, 'hints must be a list of non-empty strings');
  for (const s of item.sources ?? []) {
    if (!isNonEmptyString(s?.label) || !/^https?:\/\//.test(s?.url ?? '')) fail(r, `source ${JSON.stringify(s)} needs a label and an http(s) url`);
  }
  checkProse(r, [
    ['title', item.title],
    ['summary', item.summary],
    ['prompt', item.prompt],
    ['hints', item.hints ?? []],
    ['solutionNotes', item.solutionNotes],
    ['interviewNotes', item.interviewNotes],
    ['topics', item.topics ?? []],
    ['sources.label', (item.sources ?? []).map((s) => s?.label)],
  ]);
}

/* ---------------- per-kind checks ---------------- */

let pyodide = null;
let pyStatus = null; // null = not tried, 'ok', or a reason string

export function pythonStatus() {
  return pyStatus;
}

async function getPython(harness) {
  if (pyStatus === null) {
    if (!options.python) pyStatus = 'disabled with --no-python';
    else if (!harness) pyStatus = 'could not read the harness from src/runners/py.worker.ts';
    else {
      try {
        const require = createRequire(import.meta.url);
        const entry = require.resolve('pyodide/pyodide.mjs');
        const { loadPyodide } = await import(pathToFileURL(entry).href);
        pyodide = await loadPyodide();
        await pyodide.runPythonAsync(harness);
        pyStatus = 'ok';
      } catch (e) {
        pyStatus = `Pyodide unavailable: ${e instanceof Error ? e.message : e}`;
      }
    }
  }
  return pyStatus === 'ok' ? pyodide : null;
}

export function readPythonHarness() {
  const src = readFileSync(path.join(ROOT, 'src/runners/py.worker.ts'), 'utf8');
  const m = src.match(/const HARNESS = `([\s\S]*?)`;/);
  if (!m) throw new Error('Could not find the HARNESS string in src/runners/py.worker.ts');
  return m[1];
}

async function checkCoding(r, item, ctx) {
  const { core, client } = ctx;
  if (!/^[A-Za-z_$][\w$]*$/.test(item.fn ?? '')) fail(r, `fn "${item.fn}" is not a valid function name`);
  if (!Array.isArray(item.params)) fail(r, 'params must be a list');
  if (!Array.isArray(item.cases) || item.cases.length === 0) return fail(r, 'no cases');
  if (!item.cases.some((c) => !c.hidden)) fail(r, 'every case is hidden, so Run has nothing to show');
  item.cases.forEach((c, i) => {
    if (!Array.isArray(c.args)) fail(r, `case ${i + 1}: args must be a list`);
    else if (Array.isArray(item.params) && c.args.length !== item.params.length) fail(r, `case ${i + 1}: ${c.args.length} args for ${item.params.length} params`);
  });
  if (!isNonEmptyString(item.reference?.javascript)) return fail(r, 'reference.javascript is missing');

  const js = await core.runCodingJs(item.reference.javascript, item.fn, item.cases, item.compare);
  if (js.compileError) fail(r, `reference.javascript does not load: ${js.compileError}`);
  else {
    if (js.results.length !== item.cases.length) fail(r, `reference.javascript ran ${js.results.length} of ${item.cases.length} cases`);
    for (const c of js.results.filter((x) => !x.passed)) {
      fail(r, `reference.javascript fails case ${c.index + 1}: expected ${c.expected}, got ${c.error ? 'error ' + c.error : c.actual}`);
    }
  }

  if (item.reference.python === undefined) {
    r.skipped.push('no Python reference');
    return;
  }
  const py = await getPython(ctx.harness);
  if (!py) {
    r.skipped.push(`Python reference not run: ${pyStatus}`);
    return;
  }
  const fnName = client.pyName(item.fn);
  py.globals.set('__ec_code', item.reference.python);
  py.globals.set('__ec_fn', fnName);
  py.globals.set('__ec_cases', JSON.stringify(item.cases));
  const raw = JSON.parse(await py.runPythonAsync('__pp_run(__ec_code, __ec_fn, __ec_cases)'));
  if (raw.compileError) return fail(r, `reference.python does not load: ${raw.compileError}`);
  if ((raw.results ?? []).length !== item.cases.length) fail(r, `reference.python ran ${(raw.results ?? []).length} of ${item.cases.length} cases`);
  (raw.results ?? []).forEach((res, i) => {
    const c = item.cases[i];
    if (!res.ok) return fail(r, `reference.python case ${i + 1} raised: ${res.error}`);
    const actual = JSON.parse(res.actual ?? 'null');
    if (!core.compareValues(actual, c.expected, item.compare)) fail(r, `reference.python fails case ${i + 1}: expected ${JSON.stringify(c.expected)}, got ${res.actual}`);
  });
  r.pythonChecked = true;
}

function stripTs(code) {
  return transform(code, { transforms: ['typescript'], disableESTransforms: true }).code;
}

async function checkMutation(r, item, { core }) {
  if (!['function', 'api'].includes(item.subject)) fail(r, `subject "${item.subject}" must be function or api`);
  for (const k of ['contract', 'implementation', 'referenceTests']) if (!isNonEmptyString(item[k])) fail(r, `missing ${k}`);
  if (typeof item.starter !== 'string') fail(r, 'missing starter');
  if (!Array.isArray(item.mutants) || item.mutants.length === 0) return fail(r, 'no mutants');
  uniqueIds(r, item.mutants, 'mutant');
  for (const m of item.mutants) {
    if (!isNonEmptyString(m.label)) fail(r, `mutant ${m.id} has no label`);
    if (m.code === item.implementation) fail(r, `mutant ${m.id} is identical to the implementation`);
  }
  checkProse(r, [
    ['contract', item.contract],
    ['mutants.label', item.mutants.map((m) => m.label)],
  ]);
  if (r.failures.length) return;

  let tests;
  try {
    tests = stripTs(item.referenceTests);
  } catch (e) {
    return fail(r, `referenceTests do not compile: ${e.message}`);
  }
  const rep = await core.runMutation(item.subject, item.implementation, item.mutants, tests);
  if (rep.real.error) fail(r, `referenceTests error on the implementation: ${rep.real.error}`);
  else {
    if (rep.real.tests.length === 0) fail(r, 'referenceTests contain no tests');
    for (const t of rep.real.tests.filter((t) => !t.passed)) fail(r, `referenceTests fail on the implementation: "${t.name}": ${t.error}`);
  }
  for (const m of rep.mutants) {
    if (m.error) fail(r, `mutant ${m.id} errors before any test runs (counts as killed only by crashing): ${m.error}`);
    else if (!m.killed) fail(r, `mutant ${m.id} survives the referenceTests`);
  }

  let starter;
  try {
    starter = stripTs(item.starter);
  } catch (e) {
    return fail(r, `starter does not compile: ${e.message}`);
  }
  const st = await core.runMutation(item.subject, item.implementation, item.mutants, starter);
  if (st.real.error && !/^No tests found/.test(st.real.error)) fail(r, `starter errors on the implementation: ${st.real.error}`);
  const starterSolves = !st.real.error && st.real.tests.length > 0 && st.real.tests.every((t) => t.passed) && st.mutants.every((m) => m.killed);
  if (starterSolves) fail(r, 'starter already passes on the implementation and kills every mutant');
}

function makeDoc(html) {
  // Mirrors LocatorLab's srcdoc: the item's markup inside <body>.
  return new JSDOM(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`).window.document;
}

function checkLocator(r, item, { locators }) {
  if (!isNonEmptyString(item.html)) return fail(r, 'missing html');
  if (!isNonEmptyString(item.target)) return fail(r, 'missing target');
  // The practice frame is sandboxed without allow-scripts, so scripts never run there.
  if (/<script\b|\son[a-z]+\s*=|javascript:/i.test(item.html)) fail(r, 'html contains a script, inline event handler or javascript: URL, which the sandboxed practice frame blocks');
  const allowed = ['css', 'xpath', 'playwright'];
  if (!Array.isArray(item.allow) || item.allow.length === 0) fail(r, 'allow must list at least one syntax');
  else for (const a of item.allow) if (!allowed.includes(a)) fail(r, `allow has unknown syntax "${a}"`);
  const doc = makeDoc(item.html);
  let want;
  try {
    want = Array.from(doc.querySelectorAll(item.target));
  } catch (e) {
    return fail(r, `target "${item.target}" is not valid CSS: ${e.message}`);
  }
  if (want.length === 0) return fail(r, `target "${item.target}" matches no element`);
  const examples = Object.entries(item.examples ?? {});
  if (examples.length === 0) fail(r, 'no example answers');
  for (const a of item.allow ?? []) if (!item.examples?.[a]) r.warnings.push(`no example for allowed syntax ${a}`);
  for (const [syntax, expr] of examples) {
    if (!isNonEmptyString(expr)) {
      fail(r, `examples.${syntax} is empty`);
      continue;
    }
    if (!(item.allow ?? []).includes(syntax)) fail(r, `examples.${syntax} is given but ${syntax} is not in allow`);
    const detected = locators.detectStrategy(expr);
    if (detected !== syntax) fail(r, `examples.${syntax} "${expr}" is detected as ${detected}`);
    let got;
    try {
      got = locators.resolveExpression(doc, expr, detected);
    } catch (e) {
      fail(r, `examples.${syntax} "${expr}" throws: ${e.message}`);
      continue;
    }
    const extra = got.filter((e) => !want.includes(e)).length;
    const missing = want.filter((e) => !got.includes(e)).length;
    if (extra || missing) fail(r, `examples.${syntax} "${expr}" matches ${got.length} element(s): ${missing} target(s) missed, ${extra} extra`);
    const smells = locators.reviewLocator(expr, detected);
    if (smells.length) fail(r, `examples.${syntax} "${expr}" is flagged brittle: ${smells.map((s) => s.rule).join(', ')}`);
  }
}

let SQL = null;
async function getSql() {
  if (!SQL) {
    const initSqlJs = (await import('sql.js')).default;
    SQL = await initSqlJs({ locateFile: (f) => path.join(ROOT, 'node_modules/sql.js/dist', f) });
  }
  return SQL;
}

async function checkSql(r, item, { datasets }) {
  const ds = datasets.DATASETS[item.dataset];
  if (!ds) return fail(r, `dataset "${item.dataset}" does not exist (have: ${Object.keys(datasets.DATASETS).join(', ')})`);
  if (!isNonEmptyString(item.answer)) return fail(r, 'missing answer');
  if (typeof item.orderMatters !== 'boolean') fail(r, 'orderMatters must be true or false');
  if (item.orderMatters && !/\border\s+by\b/i.test(item.answer)) fail(r, 'orderMatters is true but the answer has no ORDER BY');
  const S = await getSql();
  const db = new S.Database();
  try {
    db.run(ds.seed);
    // Same rule as runners/sql.ts: the last result set is the answer.
    const res = db.exec(item.answer);
    const last = res[res.length - 1];
    if (!last || last.columns.length === 0) fail(r, 'answer returns no result set');
    else if (last.values.length === 0) fail(r, 'answer returns zero rows');
    else r.note = `${last.values.length} row(s)`;
  } catch (e) {
    fail(r, `answer fails on dataset ${item.dataset}: ${e.message}`);
  } finally {
    db.close();
  }
}

/** Maps each bug app key in src/labs/bughunt/registry.ts to its source file. */
function bugAppSources() {
  const dir = path.join(ROOT, 'src/labs/bughunt');
  let registry;
  try {
    registry = readFileSync(path.join(dir, 'registry.ts'), 'utf8');
  } catch {
    return null;
  }
  const fileOf = new Map();
  for (const m of registry.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](\.\/[^'"]+)['"]/g)) {
    for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean)) fileOf.set(name, m[2]);
  }
  const out = new Map();
  for (const m of registry.matchAll(/\[\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z_$][\w$]*)\s*\]/g)) {
    const rel = fileOf.get(m[2]);
    if (!rel) continue;
    const candidates = ['', '.tsx', '.ts'].map((ext) => path.join(dir, rel + ext));
    const file = candidates.find((f) => {
      try {
        return readFileSync(f, 'utf8') && true;
      } catch {
        return false;
      }
    });
    if (file) out.set(m[1], readFileSync(file, 'utf8'));
  }
  return out;
}

function checkBugHunt(r, item, ctx) {
  ctx.bugApps ??= bugAppSources() ?? new Map();
  if (!isNonEmptyString(item.app)) fail(r, 'missing app');
  else if (!ctx.bugApps.has(item.app)) fail(r, `app "${item.app}" is not registered in src/labs/bughunt/registry.ts (have: ${[...ctx.bugApps.keys()].join(', ') || 'none'})`);
  else {
    // BugHuntLab only confirms a report after the app calls onTrigger(bug.id).
    const src = ctx.bugApps.get(item.app);
    for (const b of item.bugs ?? []) {
      if (!new RegExp(`['"\`]${b.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`).test(src)) fail(r, `bug ${b.id} is never named in the ${item.app} app source, so it cannot be triggered`);
    }
  }
  if (!isNonEmptyString(item.spec)) fail(r, 'missing spec');
  if (!Array.isArray(item.areas) || item.areas.length === 0) fail(r, 'areas must be non-empty');
  if (!Array.isArray(item.bugs) || item.bugs.length === 0) return fail(r, 'no bugs');
  uniqueIds(r, item.bugs, 'bug');
  for (const b of item.bugs) {
    if (!(item.areas ?? []).includes(b.area)) fail(r, `bug ${b.id} area "${b.area}" is not in areas`);
    if (!['Critical', 'Major', 'Minor', 'Trivial'].includes(b.severity)) fail(r, `bug ${b.id} severity "${b.severity}" is invalid`);
    if (!isNonEmptyString(b.title) || !isNonEmptyString(b.hint)) fail(r, `bug ${b.id} needs a title and a hint`);
  }
  checkProse(r, [
    ['spec', item.spec],
    ['areas', item.areas ?? []],
    ['bugs.title', item.bugs.map((b) => b.title)],
    ['bugs.hint', item.bugs.map((b) => b.hint)],
  ]);
}

function checkTestDesign(r, item) {
  const techniques = ['Equivalence partitioning', 'Boundary value analysis', 'Decision table', 'Pairwise'];
  if (!techniques.includes(item.technique)) fail(r, `technique "${item.technique}" is invalid`);
  if (!Array.isArray(item.fields) || item.fields.length === 0) return fail(r, 'no fields');
  const names = new Set();
  for (const f of item.fields) {
    if (names.has(f.name)) fail(r, `field name "${f.name}" is duplicated`);
    names.add(f.name);
    if (!['number', 'text', 'select', 'boolean'].includes(f.type)) fail(r, `field ${f.name} has unknown type "${f.type}"`);
    if (f.type === 'select' && (!Array.isArray(f.options) || f.options.length === 0)) fail(r, `select field ${f.name} has no options`);
  }
  if (!Array.isArray(item.outcomes) || item.outcomes.length === 0) fail(r, 'no outcomes');
  if (new Set(item.outcomes).size !== (item.outcomes ?? []).length) fail(r, 'outcomes contain duplicates');
  if (typeof item.oracle !== 'function') fail(r, 'oracle must be a function');
  if (!Array.isArray(item.mutants) || item.mutants.length === 0) fail(r, 'no mutants');
  if (!Array.isArray(item.partitions)) fail(r, 'partitions must be a list');
  if (item.technique === 'Pairwise' && !(item.targetRows > 0)) fail(r, 'Pairwise items need targetRows');
  if (item.technique !== 'Pairwise' && item.partitions?.length === 0) fail(r, 'no partitions');
  uniqueIds(r, item.mutants, 'mutant');
  uniqueIds(r, item.partitions, 'partition');
  for (const p of item.partitions ?? []) if (!['valid', 'invalid', 'boundary'].includes(p.kind) || typeof p.matches !== 'function') fail(r, `partition ${p.id} needs a valid kind and a matches function`);
  for (const m of item.mutants ?? []) if (typeof m.fn !== 'function') fail(r, `mutant ${m.id} needs fn`);
  checkProse(r, [
    ['fields.label', item.fields.map((f) => f.label)],
    ['fields.options', item.fields.flatMap((f) => f.options ?? [])],
    ['outcomes', item.outcomes ?? []],
    ['partitions.label', (item.partitions ?? []).map((p) => p.label)],
    ['mutants.label', (item.mutants ?? []).map((m) => m.label)],
  ]);
  if (r.failures.length) return;

  const { rows, total, sampled, perField } = buildProbeRows(item);
  if (sampled) r.warnings.push(`probe space has ${total} rows; checked an evenly spaced sample of ${rows.length}`);
  r.note = `${rows.length} probe rows`;
  const outcomes = new Set(item.outcomes);
  let badOracle = 0;
  let firstBad = null;
  const mutantCaught = new Map(item.mutants.map((m) => [m.id, false]));
  const partitionHit = new Map(item.partitions.map((p) => [p.id, false]));
  const thrown = new Set();
  for (const row of rows) {
    let want;
    try {
      want = item.oracle(row);
    } catch (e) {
      thrown.add(`oracle throws on ${JSON.stringify(row)}: ${e.message}`);
      continue;
    }
    if (!outcomes.has(want)) {
      badOracle++;
      firstBad ??= { row, want };
    }
    for (const m of item.mutants) {
      if (mutantCaught.get(m.id)) continue;
      try {
        if (m.fn(row) !== want) mutantCaught.set(m.id, true);
      } catch (e) {
        thrown.add(`mutant ${m.id} throws on ${JSON.stringify(row)}: ${e.message}`);
      }
    }
    for (const p of item.partitions) {
      if (partitionHit.get(p.id)) continue;
      try {
        if (p.matches(row)) partitionHit.set(p.id, true);
      } catch (e) {
        thrown.add(`partition ${p.id} throws on ${JSON.stringify(row)}: ${e.message}`);
      }
    }
  }
  for (const t of [...thrown].slice(0, 5)) fail(r, t);
  if (badOracle) fail(r, `oracle returns "${firstBad.want}", which is not in outcomes, on ${badOracle} probe row(s), e.g. ${JSON.stringify(firstBad.row)}`);
  for (const [id, caught] of mutantCaught) if (!caught) fail(r, `mutant ${id} never differs from the oracle on any probe row (values tried: ${JSON.stringify(perField)})`);
  for (const [id, hit] of partitionHit) if (!hit) fail(r, `partition ${id} matches no probe row`);
}

function checkUiLab(r, item) {
  for (const k of ['html', 'script', 'referenceTests']) if (!isNonEmptyString(item[k])) fail(r, `missing ${k}`);
  if (typeof item.starter !== 'string') fail(r, 'missing starter');
  if (!Array.isArray(item.mutants) || item.mutants.length < 2) fail(r, `needs at least 2 mutants, has ${item.mutants?.length ?? 0}`);
  uniqueIds(r, item.mutants, 'mutant');
  for (const m of item.mutants ?? []) {
    if (!isNonEmptyString(m.script)) fail(r, `mutant ${m.id} has no script`);
    else if (m.script === item.script) fail(r, `mutant ${m.id} script is identical to the app script`);
    if (!isNonEmptyString(m.label)) fail(r, `mutant ${m.id} has no label`);
  }
  checkProse(r, [['mutants.label', (item.mutants ?? []).map((m) => m.label)]]);
  r.skipped.push('execution needs a browser: covered by npm run test:e2e');
}

function checkScenario(r, item) {
  if (!(item.minutes > 0)) fail(r, 'minutes must be positive');
  if (!Array.isArray(item.checklist) || item.checklist.length === 0) return fail(r, 'empty checklist');
  uniqueIds(r, item.checklist, 'checklist');
  for (const c of item.checklist) {
    if (![1, 2, 3].includes(c.weight)) fail(r, `checklist ${c.id} weight ${c.weight} is not 1, 2 or 3`);
    if (!Array.isArray(c.keywords) || c.keywords.length === 0 || !c.keywords.every(isNonEmptyString)) fail(r, `checklist ${c.id} needs non-empty keywords`);
    // ScenarioLab matches keywords word by word on letters and digits; a keyword with neither never matches.
    else for (const k of c.keywords) if (!/[\p{L}\p{N}]/u.test(k)) fail(r, `checklist ${c.id} keyword "${k}" has no letters or digits, so it can never match`);
    if (!isNonEmptyString(c.idea) || !isNonEmptyString(c.area)) fail(r, `checklist ${c.id} needs an area and an idea`);
  }
  const prose = [
    ['checklist.area', item.checklist.map((c) => c.area)],
    ['checklist.idea', item.checklist.map((c) => c.idea)],
  ];
  const p = item.prioritize;
  if (p) {
    const cands = p.candidates ?? [];
    uniqueIds(r, cands, 'candidate');
    if (!(Number.isInteger(p.budget) && p.budget >= 1)) fail(r, `prioritize.budget ${p.budget} must be a positive integer`);
    if (!(p.budget < cands.length)) fail(r, `prioritize.budget ${p.budget} is not below the ${cands.length} candidates`);
    const high = cands.filter((c) => c.value === 'high').length;
    if (high < p.budget) fail(r, `only ${high} high-value candidates for a budget of ${p.budget}`);
    for (const c of cands) {
      if (!['high', 'medium', 'low'].includes(c.value)) fail(r, `candidate ${c.id} value "${c.value}" is invalid`);
      if (!isNonEmptyString(c.text) || !isNonEmptyString(c.why)) fail(r, `candidate ${c.id} needs text and why`);
    }
    if (!isNonEmptyString(p.question)) fail(r, 'prioritize.question is empty');
    prose.push(['prioritize.question', p.question], ['candidates.text', cands.map((c) => c.text)], ['candidates.why', cands.map((c) => c.why)]);
  }
  checkProse(r, prose);
}

function checkDiagnose(r, item) {
  if (!isNonEmptyString(item.code)) fail(r, 'missing code');
  if (!isNonEmptyString(item.log)) fail(r, 'missing log');
  if (!Array.isArray(item.questions) || item.questions.length === 0) return fail(r, 'no questions');
  item.questions.forEach((q, i) => {
    const opts = q.options ?? [];
    if (!isNonEmptyString(q.prompt)) fail(r, `question ${i + 1} has no prompt`);
    if (opts.length < 2) fail(r, `question ${i + 1} has ${opts.length} option(s)`);
    const correct = opts.filter((o) => o.correct === true).length;
    if (correct !== 1) fail(r, `question ${i + 1} has ${correct} correct options (needs exactly 1)`);
    opts.forEach((o, j) => {
      if (!isNonEmptyString(o.text)) fail(r, `question ${i + 1} option ${j + 1} has no text`);
      if (!isNonEmptyString(o.why)) fail(r, `question ${i + 1} option ${j + 1} has no why`);
    });
    checkProse(r, [
      [`questions[${i}].prompt`, q.prompt],
      [`questions[${i}].options.text`, opts.map((o) => o.text)],
      [`questions[${i}].options.why`, opts.map((o) => o.why)],
    ]);
  });
}

/** Lines as ReviewLab numbers them: one leading line break removed, then split on line breaks. */
function reviewLines(code) {
  return code.replace(/^\r?\n/, '').split(/\r?\n/);
}

function checkReview(r, item, { types }) {
  if (!isNonEmptyString(item.code)) return fail(r, 'missing code');
  if (!Array.isArray(item.issues) || item.issues.length === 0) return fail(r, 'no issues');
  uniqueIds(r, item.issues, 'issue');
  const lines = reviewLines(item.code);
  const n = lines.length;
  for (const is of item.issues) {
    const [a, b] = Array.isArray(is.lines) ? is.lines : [];
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < a || b > n) fail(r, `issue ${is.id} lines ${JSON.stringify(is.lines)} are outside 1-${n} or reversed`);
    else if (lines.slice(a - 1, b).every((l) => !l.trim())) fail(r, `issue ${is.id} lines ${a}-${b} are blank`);
    if (!types.REVIEW_CATEGORIES.includes(is.category)) fail(r, `issue ${is.id} category "${is.category}" is not in REVIEW_CATEGORIES`);
    if (!isNonEmptyString(is.title) || !isNonEmptyString(is.explanation)) fail(r, `issue ${is.id} needs a title and an explanation`);
  }
  checkProse(r, [
    ['issues.title', item.issues.map((i) => i.title)],
    ['issues.explanation', item.issues.map((i) => i.explanation)],
  ]);
}

export const CHECKERS = {
  coding: checkCoding,
  mutation: checkMutation,
  locator: checkLocator,
  sql: checkSql,
  bughunt: checkBugHunt,
  testdesign: checkTestDesign,
  uilab: checkUiLab,
  scenario: checkScenario,
  diagnose: checkDiagnose,
  review: checkReview,
};

/** Base checks plus the kind's own checks. A crash inside a check is recorded as a failure. */
export async function checkItem(r, item, file, ctx) {
  try {
    checkBase(r, item, file);
    const checker = CHECKERS[item.kind];
    if (checker) await checker(r, item, ctx);
  } catch (e) {
    fail(r, `validator crashed on this item: ${e instanceof Error ? e.stack : e}`);
  }
}

/** Checks every item file and that the registry sees the same set. */
export async function checkItemFiles(itemFiles, registryIds, ctx) {
  const out = [];
  const fileIds = new Map();
  for (const { file, item, error } of itemFiles) {
    const id = item?.id ?? path.basename(file, '.ts');
    const group = KINDS.includes(item?.kind) ? item.kind : file.split('/').slice(-2, -1)[0];
    const r = makeResult(group, id, file);
    out.push(r);
    if (error) {
      fail(r, `file does not load: ${error}`);
      continue;
    }
    if (!item || typeof item !== 'object') {
      fail(r, 'file has no default export');
      continue;
    }
    if (fileIds.has(item.id)) fail(r, `id "${item.id}" is also used by ${fileIds.get(item.id)}`);
    fileIds.set(item.id, file);
    await checkItem(r, item, file, ctx);
  }
  const fileSet = new Set(itemFiles.map((f) => f.item?.id));
  const missing = registryIds.filter((id) => !fileSet.has(id));
  if (registryIds.length !== itemFiles.length || missing.length) {
    const r = makeResult('registry', 'ITEMS', 'src/content/index.ts');
    fail(r, `registry has ${registryIds.length} items but ${itemFiles.length} files exist under src/content/items${missing.length ? `; not backed by a file: ${missing.join(', ')}` : ''}`);
    out.push(r);
  }
  return out;
}

/* ---------------- questions and tracks ---------------- */

export function checkQuestions(questions, itemIds) {
  const seen = new Set();
  const out = [];
  for (const q of questions) {
    const r = makeResult('questions', q?.id ?? '(no id)');
    out.push(r);
    if (!isNonEmptyString(q?.id)) fail(r, 'missing id');
    else if (seen.has(q.id)) fail(r, 'duplicate question id');
    else if (itemIds.has(q.id)) fail(r, 'question id collides with a practice item id (lookup() would return the item)');
    seen.add(q?.id);
    if (!isNonEmptyString(q.question)) fail(r, 'missing question');
    if (!isNonEmptyString(q.answer)) fail(r, 'missing answer');
    if (!Array.isArray(q.lookFor) || q.lookFor.length === 0 || !q.lookFor.every(isNonEmptyString)) fail(r, 'lookFor must be a non-empty list of strings');
    if (!isNonEmptyString(q.topic)) fail(r, 'missing topic');
    if (!Array.isArray(q.roles) || q.roles.length === 0 || !q.roles.every((x) => ROLES.includes(x))) fail(r, `roles ${JSON.stringify(q.roles)} invalid`);
    if (!['Junior', 'Mid', 'Senior'].includes(q.level)) fail(r, `level "${q.level}" invalid`);
    if (!['Concept', 'Scenario', 'Behavioral', 'Tooling'].includes(q.type)) fail(r, `type "${q.type}" invalid`);
    checkProse(r, [
      ['question', q.question],
      ['answer', q.answer],
      ['lookFor', q.lookFor ?? []],
      ['mistakes', q.mistakes ?? []],
      ['followUps', q.followUps ?? []],
      ['topic', q.topic],
    ]);
  }
  return out;
}

export function checkTracks(tracks, lookup) {
  const seen = new Set();
  const out = [];
  for (const t of tracks) {
    const r = makeResult('tracks', t?.id ?? '(no id)');
    out.push(r);
    if (!isNonEmptyString(t?.id)) fail(r, 'missing id');
    else if (seen.has(t.id)) fail(r, 'duplicate track id');
    seen.add(t?.id);
    if (!ROLES.includes(t.role)) fail(r, `role "${t.role}" invalid`);
    if (!isNonEmptyString(t.title) || !isNonEmptyString(t.summary)) fail(r, 'needs a title and a summary');
    if (!Array.isArray(t.sections) || t.sections.length === 0) fail(r, 'no sections');
    for (const s of t.sections ?? []) {
      if (!Array.isArray(s.items) || s.items.length === 0) fail(r, `section "${s.title}" has no items`);
      for (const id of s.items ?? []) if (!lookup(id)) fail(r, `section "${s.title}" references unknown id "${id}"`);
    }
    checkProse(r, [
      ['title', t.title],
      ['summary', t.summary],
      ['sections.title', (t.sections ?? []).map((s) => s.title)],
      ['sections.note', (t.sections ?? []).map((s) => s.note)],
    ]);
  }
  return out;
}

