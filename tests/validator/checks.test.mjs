/*
  Self-test for the content validator: node --test tests/validator/

  Each case takes a real item that passes every check, breaks it in one way,
  and asserts the check that should notice reports it. A check that cannot
  fail shows up here as a case that stays green after the break.
*/

import { before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { checkItem, checkItemFiles, checkQuestions, checkTracks, loadModules, makeResult, readPythonHarness } from '../../scripts/lib/checks.mjs';

let ctx;
const baseItem = new Map(); // kind -> { item, file } that passes every check

function clone(v) {
  if (Array.isArray(v)) return v.map(clone);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)]));
  return v; // functions and primitives are shared
}

before(async () => {
  const mods = await loadModules();
  ctx = { ...mods, harness: readPythonHarness() };
  for (const { file, item } of mods.itemFiles) {
    if (!item || baseItem.has(item.kind)) continue;
    const r = makeResult(item.kind, item.id, file);
    await checkItem(r, item, file, ctx);
    if (r.failures.length === 0) baseItem.set(item.kind, { item, file });
  }
});

async function failuresAfter(kind, mutate, file) {
  const base = baseItem.get(kind);
  assert.ok(base, `no ${kind} item passes every check, so there is nothing to break`);
  const item = clone(base.item);
  mutate(item);
  const r = makeResult(kind, item.id, file ?? base.file);
  await checkItem(r, item, file ?? base.file, ctx);
  return r.failures;
}

async function expectCaught(kind, mutate, pattern, file) {
  const failures = await failuresAfter(kind, mutate, file);
  assert.ok(
    failures.some((f) => pattern.test(f)),
    `expected a failure matching ${pattern}, got:\n${failures.map((f) => '  - ' + f).join('\n') || '  (none)'}`,
  );
}

const ROCKET = String.fromCodePoint(0x1f680);
const EM_DASH = String.fromCodePoint(0x2014);

describe('base fields', () => {
  test('id that differs from the filename', () => expectCaught('coding', (i) => (i.id = 'renamed-item'), /does not match its filename/));
  test('item filed under the wrong kind folder', () =>
    expectCaught('coding', () => {}, /is filed under items\/sql\//, `src/content/items/sql/${baseItem.get('coding').item.id}.ts`));
  test('unknown role', () => expectCaught('coding', (i) => (i.roles = ['tester']), /role "tester"/));
  test('unknown difficulty', () => expectCaught('coding', (i) => (i.difficulty = 'Brutal'), /difficulty "Brutal"/));
  test('empty prompt', () => expectCaught('coding', (i) => (i.prompt = '  '), /missing or empty prompt/));
  test('emoji in the summary', () => expectCaught('coding', (i) => (i.summary += ` ${ROCKET}`), /summary contains an emoji \(U\+1F680\)/));
  test('em dash in a hint', () => expectCaught('coding', (i) => (i.hints = [`one ${EM_DASH} two`]), /hints\[0\] contains an em dash/));
  test('em dash in a mutant label', () => expectCaught('mutation', (i) => (i.mutants[0].label = `a ${EM_DASH} b`), /mutants\.label\[0\] contains an em dash/));
});

describe('coding', () => {
  test('wrong expected value fails the JavaScript and Python references', async () => {
    const failures = await failuresAfter('coding', (i) => (i.cases[0].expected = { never: 'matches' }));
    assert.ok(failures.some((f) => /reference\.javascript fails case 1/.test(f)), failures.join('\n'));
    if (baseItem.get('coding').item.reference.python) assert.ok(failures.some((f) => /reference\.python fails case 1/.test(f)), failures.join('\n'));
  });
  test('Python reference without the function', () => expectCaught('coding', (i) => (i.reference.python = 'def unrelated():\n    return 1\n'), /reference\.python does not load: Could not find a function/));
  test('JavaScript reference that does not parse', () => expectCaught('coding', (i) => (i.reference.javascript = 'function (('), /reference\.javascript does not load/));
  test('case with the wrong number of args', () => expectCaught('coding', (i) => i.cases[0].args.push('extra'), /case 1: \d+ args for \d+ params/));
  test('every case hidden', () => expectCaught('coding', (i) => i.cases.forEach((c) => (c.hidden = true)), /every case is hidden/));
});

describe('mutation', () => {
  test('reference tests that catch nothing', () => expectCaught('mutation', (i) => (i.referenceTests = 'test("trivial", () => { expect(1).toBe(1); });'), /survives the referenceTests/));
  test('reference tests that fail on the real code', () => expectCaught('mutation', (i) => (i.referenceTests = 'test("false alarm", () => { expect(1).toBe(2); });'), /referenceTests fail on the implementation/));
  test('starter that already solves the item', () => expectCaught('mutation', (i) => (i.starter = i.referenceTests), /starter already passes/));
  test('mutant that does not compile', () => expectCaught('mutation', (i) => (i.mutants[0].code = 'function ((('), /errors before any test runs/));
  test('mutant identical to the implementation', () => expectCaught('mutation', (i) => (i.mutants[0].code = i.implementation), /identical to the implementation/));
});

describe('locator', () => {
  test('target that matches nothing', () => expectCaught('locator', (i) => (i.target = '#no-such-element-here'), /matches no element/));
  test('example that matches extra elements', () =>
    expectCaught('locator', (i) => {
      i.allow = ['css'];
      i.examples = { css: '*' };
    }, /extra/));
  test('example filed under the wrong syntax', () =>
    expectCaught('locator', (i) => {
      i.allow = ['css', 'xpath'];
      i.examples = { css: '//body' };
    }, /is detected as xpath/));
  test('brittle example that still matches the target', () =>
    expectCaught('locator', (i) => {
      const doc = new JSDOM(`<!doctype html><html><head></head><body>${i.html}</body></html>`).window.document;
      const el = doc.querySelectorAll(i.target);
      // Absolute, index-based XPath to each target element.
      const abs = (node) => {
        const parts = [];
        for (let n = node; n && n.nodeType === 1; n = n.parentElement) {
          const same = Array.from(n.parentElement?.children ?? [n]).filter((s) => s.tagName === n.tagName);
          parts.unshift(`${n.tagName.toLowerCase()}[${same.indexOf(n) + 1}]`);
        }
        return '/' + parts.join('/');
      };
      i.allow = ['xpath'];
      i.examples = { xpath: Array.from(el).map(abs).join(' | ') };
    }, /flagged brittle: .*Absolute XPath/));
  test('script in the practice markup', () => expectCaught('locator', (i) => (i.html += '<script>alert(1)</script>'), /contains a script/));
});

describe('sql', () => {
  const strip = (s) => s.trim().replace(/;\s*$/, '');
  test('answer that returns no rows', () => expectCaught('sql', (i) => (i.answer = `SELECT * FROM (${strip(i.answer)}) WHERE 1 = 0`), /zero rows/));
  test('answer that does not run', () => expectCaught('sql', (i) => (i.answer = 'SELEC 1'), /answer fails on dataset/));
  test('ordered item without ORDER BY', () =>
    expectCaught('sql', (i) => {
      i.answer = 'SELECT 1';
      i.orderMatters = true;
    }, /no ORDER BY/));
  test('unknown dataset', () => expectCaught('sql', (i) => (i.dataset = 'warehouse'), /dataset "warehouse" does not exist/));
});

describe('testdesign', () => {
  test('mutant identical to the oracle', () => expectCaught('testdesign', (i) => (i.mutants = [{ id: 'same', label: 'Same', fn: i.oracle }]), /mutant same never differs/));
  test('partition no row can match', () => expectCaught('testdesign', (i) => i.partitions.push({ id: 'never', label: 'Never', kind: 'valid', matches: () => false }), /partition never matches no probe row/));
  test('oracle outcome outside the outcome list', () => expectCaught('testdesign', (i) => (i.oracle = () => 'Not an outcome'), /not in outcomes/));
  test('probes find integer and decimal boundaries and blank input', async () => {
    const synthetic = (i) => {
      const adult = (r) => (r.age === '' ? 'Missing' : r.age >= 18 ? 'Adult' : 'Minor');
      Object.assign(i, {
        technique: 'Boundary value analysis',
        fields: [{ name: 'age', label: 'Age', type: 'number' }],
        outcomes: ['Adult', 'Minor', 'Missing'],
        oracle: adult,
        partitions: [
          { id: 'just-below', label: 'Just below', kind: 'boundary', matches: (r) => r.age !== '' && r.age >= 17.5 && r.age < 18 },
          { id: 'blank', label: 'Blank', kind: 'invalid', matches: (r) => r.age === '' },
        ],
        mutants: [
          { id: 'off-by-one', label: 'Uses > 18', fn: (r) => (r.age === '' ? 'Missing' : r.age > 18 ? 'Adult' : 'Minor') },
          { id: 'half', label: 'Rounds 17.5 up', fn: (r) => (r.age === '' ? 'Missing' : r.age >= 17.5 ? 'Adult' : 'Minor') },
          { id: 'large', label: 'Breaks above 5000', fn: (r) => (r.age !== '' && r.age > 5000 ? 'Minor' : adult(r)) },
          { id: 'blank', label: 'Treats blank as 0', fn: (r) => (r.age === '' ? 'Minor' : adult(r)) },
        ],
      });
    };
    const failures = await failuresAfter('testdesign', synthetic);
    assert.deepEqual(failures, []);
  });
});

describe('other kinds', () => {
  test('uilab with one mutant', () => expectCaught('uilab', (i) => (i.mutants = i.mutants.slice(0, 1)), /needs at least 2 mutants/));
  test('bughunt bug in an unknown area', () => expectCaught('bughunt', (i) => (i.bugs[0].area = 'Nowhere'), /area "Nowhere" is not in areas/));
  test('bughunt bug the app never triggers', () => expectCaught('bughunt', (i) => (i.bugs[0].id = 'never-triggered-bug'), /never-triggered-bug is never named/));
  test('bughunt app that is not registered', () => expectCaught('bughunt', (i) => (i.app = 'no-such-app'), /is not registered/));
  test('scenario duplicate checklist id', () => expectCaught('scenario', (i) => (i.checklist[1].id = i.checklist[0].id), /checklist id ".*" is duplicated/));
  test('scenario weight out of range', () => expectCaught('scenario', (i) => (i.checklist[0].weight = 4), /weight 4/));
  test('scenario keyword that can never match', () => expectCaught('scenario', (i) => (i.checklist[0].keywords = ['!!!']), /can never match/));
  test('scenario budget not below the candidate count', () =>
    expectCaught('scenario', (i) => {
      i.prioritize = { budget: 2, question: 'Pick two', candidates: [{ id: 'a', text: 'A', value: 'high', why: 'x' }, { id: 'b', text: 'B', value: 'high', why: 'y' }] };
    }, /is not below the 2 candidates/));
  test('scenario with too few high-value candidates', () =>
    expectCaught('scenario', (i) => {
      i.prioritize = { budget: 2, question: 'Pick two', candidates: ['a', 'b', 'c'].map((id) => ({ id, text: id, value: 'low', why: 'x' })) };
    }, /only 0 high-value candidates for a budget of 2/));
  test('diagnose question with two correct options', () => expectCaught('diagnose', (i) => i.questions[0].options.forEach((o) => (o.correct = true)), /question 1 has \d+ correct options/));
  test('diagnose option without a why', () => expectCaught('diagnose', (i) => (i.questions[0].options[0].why = ''), /option 1 has no why/));
  test('review issue past the last line', () => expectCaught('review', (i) => (i.issues[0].lines = [1, 9999]), /outside 1-\d+/));
  test('review issue on blank lines', () =>
    expectCaught('review', (i) => {
      i.code = '\nconst a = 1;\n\nconst b = 2;\n';
      i.issues = [{ ...i.issues[0], lines: [2, 2] }];
    }, /lines 2-2 are blank/));
  test('review category outside the offered list', () => expectCaught('review', (i) => (i.issues[0].category = 'Vibes'), /not in REVIEW_CATEGORIES/));
});

describe('questions, tracks and the registry', () => {
  const q = () => clone(ctx.content.QUESTIONS[0]);
  test('duplicate question id', () => {
    const rs = checkQuestions([q(), q()], new Set());
    assert.match(rs[1].failures.join('\n'), /duplicate question id/);
  });
  test('question without lookFor', () => {
    const rs = checkQuestions([{ ...q(), lookFor: [] }], new Set());
    assert.match(rs[0].failures.join('\n'), /lookFor/);
  });
  test('question id that shadows an item id', () => {
    const rs = checkQuestions([q()], new Set([ctx.content.QUESTIONS[0].id]));
    assert.match(rs[0].failures.join('\n'), /collides with a practice item id/);
  });
  test('track that points at an unknown id', () => {
    const t = clone(ctx.content.TRACKS[0]);
    t.sections[0].items = [...t.sections[0].items, 'no-such-item'];
    const rs = checkTracks([t], ctx.content.lookup);
    assert.match(rs[0].failures.join('\n'), /unknown id "no-such-item"/);
  });
  test('registry and files disagree', async () => {
    const one = ctx.itemFiles.find((f) => f.item?.kind === 'review');
    const rs = await checkItemFiles([one], [one.item.id, 'only-in-registry'], ctx);
    assert.match(rs.find((r) => r.group === 'registry')?.failures.join('\n') ?? '', /not backed by a file: only-in-registry/);
  });
  test('two files with the same id', async () => {
    const one = ctx.itemFiles.find((f) => f.item?.kind === 'review');
    const rs = await checkItemFiles([one, { ...one, file: one.file.replace(/[^/]+\.ts$/, 'copy.ts') }], [one.item.id], ctx);
    assert.match(rs[1].failures.join('\n'), /is also used by/);
  });
});
