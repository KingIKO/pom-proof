/*
  Content validator: npm run validate

  Loads the real content registry through Vite (so import.meta.glob works),
  then checks every item against the runners the site itself uses. Prints a
  per-kind table and exits non-zero on any failure. The checks live in
  scripts/lib/checks.mjs; tests/validator proves each one fires.

  Options:
    --require-all-kinds   fail when a kind has no items (default: reported as NO ITEMS)
    --no-python           skip Python reference checks (reported as SKIPPED)
    --json <file>         also write the results as JSON
*/

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { KINDS, ROOT, checkItemFiles, checkQuestions, checkTracks, loadModules, options, pythonStatus, readPythonHarness } from './lib/checks.mjs';

const args = process.argv.slice(2);
const REQUIRE_ALL_KINDS = args.includes('--require-all-kinds');
const JSON_OUT = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
if (args.includes('--no-python')) options.python = false;

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

async function main() {
  const started = Date.now();
  let mods;
  try {
    mods = await loadModules();
  } catch (e) {
    console.error('FAILED to load content through Vite:\n' + (e instanceof Error ? e.stack : e));
    process.exit(1);
  }
  const { content, itemFiles } = mods;
  let harness = null;
  try {
    harness = readPythonHarness();
  } catch (e) {
    console.error(`Python harness: ${e.message}`);
  }
  const ctx = { ...mods, harness };

  const registryIds = content.ITEMS.map((i) => i.id);
  const results = [
    ...(await checkItemFiles(itemFiles, registryIds, ctx)),
    ...checkQuestions(content.QUESTIONS, new Set(registryIds)),
    ...checkTracks(content.TRACKS, content.lookup),
  ];

  const failing = results.filter((r) => r.failures.length);
  if (failing.length) {
    console.log('\nFAILURES');
    for (const r of failing) {
      console.log(`\n  [${r.group}] ${r.id}${r.file ? `  (${r.file})` : ''}`);
      for (const f of r.failures) console.log(`    - ${f}`);
    }
  }
  const warned = results.filter((r) => r.warnings.length);
  if (warned.length) {
    console.log('\nWARNINGS (do not fail the run)');
    for (const r of warned) for (const w of r.warnings) console.log(`  [${r.group}] ${r.id}: ${w}`);
  }
  const skipped = results.filter((r) => r.skipped.length);
  if (skipped.length) {
    console.log('\nSKIPPED CHECKS');
    const byReason = new Map();
    for (const r of skipped) for (const s of r.skipped) byReason.set(s, [...(byReason.get(s) ?? []), r.id]);
    for (const [reason, ids] of byReason) console.log(`  SKIPPED ${reason}: ${ids.join(', ')}`);
  }

  let anyFail = failing.length > 0;
  const pyStatus = pythonStatus();
  console.log('\n' + pad('Kind', 12) + pad('Items', 7) + pad('Passed', 8) + pad('Failed', 8) + 'Status / notes');
  console.log('-'.repeat(72));
  for (const g of [...KINDS, 'questions', 'tracks', 'registry']) {
    const rs = results.filter((r) => r.group === g);
    if (g === 'registry' && rs.length === 0) continue;
    const failed = rs.filter((r) => r.failures.length).length;
    let status;
    if (rs.length === 0) {
      const required = REQUIRE_ALL_KINDS && KINDS.includes(g);
      status = required ? 'FAIL: NO ITEMS (--require-all-kinds)' : 'NO ITEMS (nothing checked)';
      if (required) anyFail = true;
    } else status = failed ? 'FAIL' : 'PASS';
    const notes = [];
    if (g === 'coding' && rs.length) {
      const run = rs.filter((r) => r.pythonChecked).length;
      const withPy = rs.filter((r) => !r.skipped.includes('no Python reference')).length;
      notes.push(`python ${run}/${withPy} run${pyStatus && pyStatus !== 'ok' ? ` (${pyStatus})` : ''}`);
    }
    if (g === 'uilab' && rs.length) notes.push('structural only; executed in e2e');
    console.log(pad(g, 12) + pad(rs.length, 7) + pad(rs.length ? rs.length - failed : '-', 8) + pad(rs.length ? failed : '-', 8) + status + (notes.length ? `; ${notes.join('; ')}` : ''));
  }
  console.log('-'.repeat(72));
  console.log(`${itemFiles.length} items, ${content.QUESTIONS.length} questions, ${content.TRACKS.length} tracks checked in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  console.log(anyFail ? `RESULT: FAIL (${failing.length} entr${failing.length === 1 ? 'y' : 'ies'} with failures)` : 'RESULT: PASS');

  if (JSON_OUT) {
    const out = path.resolve(ROOT, JSON_OUT);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify({ pass: !anyFail, results }, null, 2));
  }
  process.exit(anyFail ? 1 : 0);
}

main().catch((e) => {
  console.error('Validator crashed:', e instanceof Error ? e.stack : e);
  process.exit(1);
});
