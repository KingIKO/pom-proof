import { transform } from 'sucrase';
import { describe, expect, it } from 'vitest';
import type { GradeResult, Json, Problem } from '../../src/lib/contracts';
import { gradeSuite, matchesParam, type MutationRequest } from '../../src/engines/mutation/suite';

/** Loads a fresh module per call, like the worker's Blob import, without a browser. */
async function load(source: string, name: string) {
  const exports: Record<string, unknown> = {};
  const { code } = transform(source, { transforms: ['imports'] });
  new Function('exports', code)(exports);
  const fn = exports[name];
  if (typeof fn !== 'function') throw new Error(`Export a function named ${name}`);
  return fn as (...args: unknown[]) => unknown;
}

const problem: Pick<Problem<'test-design'>, 'exportName' | 'implementation' | 'mutants' | 'params'> = {
  exportName: 'quoteFee',
  implementation: `export function quoteFee(subtotal, zone) {
    if (zone === 'remote') return 900;
    return subtotal >= 5000 ? 0 : 450;
  }`,
  mutants: [
    { name: 'excludes-threshold', teaches: 'Check the exact threshold.', implementation: `export function quoteFee(subtotal, zone) {
      if (zone === 'remote') return 900;
      return subtotal > 5000 ? 0 : 450;
    }` },
    { name: 'one-cent-below', teaches: 'Check one cent below.', implementation: `export function quoteFee(subtotal, zone) {
      if (zone === 'remote') return 900;
      return subtotal >= 4999 ? 0 : 450;
    }` },
    { name: 'waives-remote', teaches: 'Cross the threshold with the remote rule.', implementation: `export function quoteFee(subtotal, zone) {
      if (subtotal >= 5000) return 0;
      return zone === 'remote' ? 900 : 450;
    }` },
  ],
  params: [
    { name: 'subtotal', type: 'number', label: 'Subtotal' },
    { name: 'zone', type: 'enum', label: 'Zone', values: ['local', 'remote'] },
  ],
};

type Row = { args: Json[]; expected: Json };
const rows = (...entries: Row[]) => ({ rows: entries });
const run = (answer: MutationRequest['answer'], overrides: Partial<MutationRequest> = {}) =>
  gradeSuite({ ...problem, answer, ...overrides }, load);
const graded = (result: GradeResult<'test-design'>) => {
  expect(result.status, JSON.stringify(result)).toBe('graded');
  return result as Extract<GradeResult<'test-design'>, { status: 'graded' }>;
};

const strongRows = rows(
  { args: [4999, 'local'], expected: 450 },
  { args: [5000, 'local'], expected: 0 },
  { args: [5000, 'remote'], expected: 900 },
);
const strongSource = `export function test(quoteFee) {
  for (const [subtotal, zone, expected] of [[4999, 'local', 450], [5000, 'local', 0], [5000, 'remote', 900]]) {
    if (quoteFee(subtotal, zone) !== expected) throw new Error(zone + ' ' + subtotal);
  }
}`;

describe('mutation grader', () => {
  it.each([
    { name: 'a test function', answer: { source: strongSource } },
    { name: 'a table of rows', answer: strongRows },
  ])('gives full marks to $name that passes the real code and kills every mutant', async ({ answer }) => {
    const { score, details } = graded(await run(answer));
    expect(score).toBe(1);
    expect(details.validOnReference).toBe(true);
    expect(details.failedRows).toEqual([]);
    expect(details.mutants).toEqual(problem.mutants.map(({ name }) => ({ name, killed: true })));
  });

  it('scores the share of mutants killed and names what each survivor teaches', async () => {
    const { score, details } = graded(await run(rows({ args: [5000, 'local'], expected: 0 }, { args: [100, 'remote'], expected: 900 })));
    expect(score).toBeCloseTo(1 / 3);
    expect(details.mutants).toEqual([
      { name: 'excludes-threshold', killed: true },
      { name: 'one-cent-below', killed: false, teaches: 'Check one cent below.' },
      { name: 'waives-remote', killed: false, teaches: 'Cross the threshold with the remote rule.' },
    ]);
  });

  it('gives a weak suite that passes everywhere zero', async () => {
    const source = `export function test(quoteFee) {
      if (quoteFee(2400, 'local') !== 450) throw new Error('low');
      if (quoteFee(9200, 'local') !== 0) throw new Error('high');
    }`;
    const { score, details } = graded(await run({ source }));
    expect(score).toBe(0);
    expect(details.validOnReference).toBe(true);
  });

  describe('a check that fails on the real implementation scores zero', () => {
    it('for a test function that throws on the real code, even though it also fails every mutant', async () => {
      const { score, details } = graded(await run({ source: 'export function test() { throw new Error("always red"); }' }));
      expect(score).toBe(0);
      expect(details.validOnReference).toBe(false);
      expect(details.referenceFailure).toBe('always red');
      expect(details.mutants.every(({ killed }) => !killed)).toBe(true);
    });

    it('for a table row whose expected value is wrong, naming the row', async () => {
      const { score, details } = graded(await run(rows(
        { args: [4999, 'local'], expected: 450 },
        { args: [5000, 'local'], expected: 450 },
        { args: [5000, 'remote'], expected: 900 },
      )));
      expect(score).toBe(0);
      expect(details.validOnReference).toBe(false);
      expect(details.failedRows).toEqual([{ row: 2, message: expect.stringContaining('fails on the real function') }]);
      expect(details.mutants.every(({ killed }) => !killed)).toBe(true);
    });

    it('for a row that makes the real function throw', async () => {
      const throwing = { ...problem, implementation: 'export function quoteFee(s) { if (s < 0) throw new Error("negative"); return 0; }' };
      const { details } = graded(await run(rows({ args: [-1, 'local'], expected: 0 }), throwing));
      expect(details.failedRows.map(({ row }) => row)).toEqual([1]);
    });
  });

  it('compares row results as JSON values', async () => {
    const objects = { ...problem, params: [{ name: 'n', type: 'number' as const, label: 'N' }], implementation: 'export function quoteFee(n) { return { n, list: [n] }; }', mutants: [
      { name: 'reorders-keys', teaches: 'Key order does not matter.', implementation: 'export function quoteFee(n) { return { list: [n], n }; }' },
      { name: 'string-value', teaches: 'Types matter.', implementation: 'export function quoteFee(n) { return { n: String(n), list: [n] }; }' },
      { name: 'class-instance', teaches: 'Plain objects only.', implementation: 'export function quoteFee(n) { return new (class { n = n; list = [n]; })(); }' },
    ] };
    const { details } = graded(await run(rows({ args: [1], expected: { n: 1, list: [1] } }), objects));
    expect(details.validOnReference).toBe(true);
    expect(details.mutants.map(({ name, killed }) => [name, killed])).toEqual([
      ['reorders-keys', false], ['string-value', true], ['class-instance', true],
    ]);
  });

  describe('invalid answers', () => {
    it.each([
      { name: 'no rows', answer: { rows: [] }, message: 'Add at least one test row' },
      { name: 'a missing argument', answer: rows({ args: [5000], expected: 0 }), message: 'Row 1 needs one value' },
      { name: 'a string for a number', answer: rows({ args: [4999, 'local'], expected: 450 }, { args: ['5000', 'local'], expected: 0 }), message: 'Row 2 needs one value' },
      { name: 'an unknown enum value', answer: rows({ args: [5000, 'abroad'], expected: 0 }), message: 'Row 1 needs one value' },
      { name: 'an empty test', answer: { source: '  ' }, message: 'Write a test' },
      { name: 'a test without the test export', answer: { source: 'export function check() {}' }, message: 'Export a function named test' },
      { name: 'a syntax error', answer: { source: 'export function test( {' }, message: '' },
    ])('rejects $name', async ({ answer, message }) => {
      expect(await run(answer as MutationRequest['answer']))
        .toMatchObject({ kind: 'test-design', status: 'invalid-answer', message: expect.stringContaining(message) });
    });
  });

  it.each([
    { value: 1.5, param: { name: 'n', type: 'number', label: 'N' }, ok: true },
    { value: Number.NaN, param: { name: 'n', type: 'number', label: 'N' }, ok: false },
    { value: '1', param: { name: 'n', type: 'number', label: 'N' }, ok: false },
    { value: false, param: { name: 'b', type: 'boolean', label: 'B' }, ok: true },
    { value: 'false', param: { name: 'b', type: 'boolean', label: 'B' }, ok: false },
    { value: 'remote', param: { name: 'z', type: 'enum', label: 'Z', values: ['local', 'remote'] }, ok: true },
    { value: 'Remote', param: { name: 'z', type: 'enum', label: 'Z', values: ['local', 'remote'] }, ok: false },
  ] as const)('matches $value against a $param.type input: $ok', ({ value, param, ok }) => {
    expect(matchesParam(value, param as NonNullable<Problem<'test-design'>['params']>[number])).toBe(ok);
  });
});
