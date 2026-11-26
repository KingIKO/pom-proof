import { describe, expect, it, vi } from 'vitest';
import type { Json, Problem } from '../../src/lib/contracts';
import { checkCode, createCodeGrader } from '../../src/engines/code/grade';
import { evaluateCode, type CodeRequest } from '../../src/runners/code-evaluate';

const problem: Problem<'code'> = {
  id: 'code/unit-sample',
  kind: 'code',
  title: 'Unit sample',
  topic: 'reporting',
  difficulty: 'easy',
  minutes: 1,
  roles: ['sdet'],
  exportName: 'summarize',
  starters: { js: 'export function summarize() {}', ts: 'export function summarize() {}', python: 'def summarize(): pass' },
  vectors: [
    { name: 'one', args: [[1]], expected: { total: 1, items: [1] } },
    { name: 'two', args: [[1, 2]], expected: { total: 3, items: [1, 2] } },
    { name: 'none', args: [[]], expected: { total: 0, items: [] } },
    { name: 'negative', args: [[-1, 4]], expected: { total: 3, items: [-1, 4] } },
    { name: 'nested', args: [[0]], expected: { total: 0, items: [0] } },
  ],
  reference: {
    language: 'js',
    source: 'export function summarize(xs) { return { items: [...xs], total: xs.reduce((a, b) => a + b, 0) }; }',
  },
  decoy: { language: 'js', source: 'export function summarize(xs) { return { total: xs.length, items: xs }; }' },
};

const grade = createCodeGrader(evaluateCode);
const submit = (source: string, language: 'js' | 'ts' = 'js') => grade(problem, { kind: 'code', value: { language, source } });

/** Runs one solution against one expected value through the real evaluator. */
async function compare(body: string, expected: CodeRequest['vectors'][number]['expected']) {
  const reply = await evaluateCode({
    language: 'js',
    source: `export function f() { ${body} }`,
    exportName: 'f',
    vectors: [{ args: [], expected, visible: true }],
  });
  expect(reply).toHaveProperty('checks');
  return (reply as { checks: Array<{ passed: boolean; error?: string }> }).checks[0];
}

describe('code grader', () => {
  it('gives the reference full marks across visible and hidden vectors', async () => {
    const result = await submit(problem.reference.source);
    expect(result).toMatchObject({ kind: 'code', status: 'graded', score: 1 });
    expect((result as { details: { vectors: unknown[] } }).details.vectors).toHaveLength(problem.vectors.length);
  });

  it('scores the share of vectors passed', async () => {
    // The decoy returns the length as total: right for [1] and []; wrong for [1, 2], [-1, 4] and [0].
    expect(await submit(problem.decoy.source)).toMatchObject({ status: 'graded', score: 2 / 5 });
  });

  describe('input preservation', () => {
    const mutationMessage = 'Your function changed its input. The problem asks you to leave it unchanged.';
    const mutating = {
      language: 'js',
      source: problem.reference.source.replace('return { items: [...xs],', 'const items = [...xs]; xs.push(0); return { items,'),
    } as const;

    it('fails otherwise correct answers that mutate their input on Run and Submit', async () => {
      for (const mode of ['run', 'submit'] as const) {
        const target = structuredClone(problem);
        const { result, checks } = await checkCode(target, { kind: 'code', value: mutating }, evaluateCode, mode);
        expect(result).toMatchObject({ status: 'graded', score: 0 });
        expect(checks?.[0]).toMatchObject({ visible: true, passed: false, error: mutationMessage });
        if (mode === 'submit') expect(checks?.at(-1)).toEqual({ visible: false, passed: false });
        expect(target.vectors).toEqual(problem.vectors);
      }
    });

    it('accepts mutation only when the problem opts in', async () => {
      const optedIn = { ...structuredClone(problem), allowInputMutation: true };
      expect(await grade(optedIn, { kind: 'code', value: mutating })).toMatchObject({ status: 'graded', score: 1 });
    });
  });

  describe('deep equality', () => {
    it.each([
      { name: 'keys in another order', body: 'return { b: [1, { c: null }], a: "x" };', expected: { a: 'x', b: [1, { c: null }] }, passed: true },
      { name: 'an extra key', body: 'return { a: 1, b: 2 };', expected: { a: 1 }, passed: false },
      { name: 'a missing key', body: 'return { a: 1 };', expected: { a: 1, b: 2 }, passed: false },
      { name: 'a number for a string', body: 'return 1;', expected: '1', passed: false },
      { name: 'an array for an object', body: 'return [];', expected: {}, passed: false },
      { name: 'a longer array', body: 'return [1, 2, 3];', expected: [1, 2], passed: false },
      { name: 'array order', body: 'return [2, 1];', expected: [1, 2], passed: false },
      { name: 'null for an empty object', body: 'return null;', expected: {}, passed: false },
      { name: 'nested values that differ', body: 'return [[1, [2, 3]]];', expected: [[1, [2, 4]]], passed: false },
    ] as Array<{ name: string; body: string; expected: Json; passed: boolean }>)('compares $name', async ({ body, expected, passed }) => {
      expect((await compare(body, expected)).passed).toBe(passed);
    });

    it.each([
      { name: 'undefined', body: 'return undefined;' },
      { name: 'NaN', body: 'return NaN;' },
      { name: 'Infinity', body: 'return Infinity;' },
      { name: 'a Date', body: 'return new Date(0);' },
      { name: 'a class instance', body: 'return new (class Point { x = 1 })();' },
      { name: 'a function', body: 'return () => 1;' },
      { name: 'a cycle', body: 'const a = []; a.push(a); return a;' },
    ])('fails $name as not JSON', async ({ body }) => {
      const check = await compare(body, null);
      expect(check.passed).toBe(false);
      expect(check.error).toContain('did not return a JSON value');
    });

    it('awaits an async solution', async () => {
      expect((await compare('return Promise.resolve([1]);', [1])).passed).toBe(true);
    });

    it('fails a vector whose call throws and keeps grading the rest', async () => {
      const result = await submit('export function summarize(xs) { if (xs.length === 0) throw new Error("empty"); return { items: [...xs], total: xs.reduce((a, b) => a + b, 0) }; }');
      expect(result).toMatchObject({ status: 'graded', score: 4 / 5 });
    });
  });

  describe('hidden vectors', () => {
    it('shows the first half of the vectors by name and hides the rest', async () => {
      const { result, checks } = await checkCode(problem, { kind: 'code', value: problem.reference }, evaluateCode, 'submit');
      const names = (result as { details: { vectors: Array<{ name: string }> } }).details.vectors.map(({ name }) => name);
      expect(names).toEqual(['one', 'two', 'none', 'Hidden check 1', 'Hidden check 2']);
      expect(checks?.map(({ visible }) => visible)).toEqual([true, true, true, false, false]);
    });

    it('never returns the actual value or logs of a hidden vector', async () => {
      const source = 'export function summarize(xs) { console.log("seen", xs); return { total: -99, items: xs }; }';
      const { checks } = await checkCode(problem, { kind: 'code', value: { language: 'js', source } }, evaluateCode, 'submit');
      const hidden = checks!.filter(({ visible }) => !visible);
      expect(hidden).toHaveLength(2);
      for (const check of hidden) expect(Object.keys(check).sort()).toEqual(['passed', 'visible']);
      expect(checks![0]).toMatchObject({ visible: true, logs: ['seen [1]'], actual: { total: -99, items: [1] } });
    });

    it('runs only the visible vectors in run mode', async () => {
      const runner = vi.fn(evaluateCode);
      const { result } = await checkCode(problem, { kind: 'code', value: problem.reference }, runner, 'run');
      expect(runner).toHaveBeenCalledOnce();
      expect(runner.mock.calls[0][0].vectors).toHaveLength(3);
      expect(result).toMatchObject({ status: 'graded', score: 1 });
    });

    it('can pass the visible vectors and fail on the hidden ones', async () => {
      const source = 'export function summarize(xs) { return { total: xs.reduce((a, b) => a + b, 0), items: xs.length > 1 && xs[0] < 0 ? [] : [...xs] }; }';
      const result = await submit(source);
      const vectors = (result as { details: { vectors: Array<{ name: string; passed: boolean }> } }).details.vectors;
      expect(vectors.filter(({ passed }) => !passed).map(({ name }) => name)).toEqual(['Hidden check 1']);
    });
  });

  describe('invalid answers', () => {
    it.each([
      { name: 'empty source', value: { language: 'js', source: '   ' }, message: 'Enter a solution' },
      { name: 'an unknown language', value: { language: 'rust', source: 'fn main() {}' }, message: 'Choose JavaScript, TypeScript, or Python.' },
      { name: 'a missing export', value: { language: 'js', source: 'export function other() {}' }, message: 'Export a function named summarize' },
      { name: 'a syntax error', value: { language: 'js', source: 'export function summarize( {' }, message: '' },
      { name: 'an import', value: { language: 'js', source: 'import fs from "fs"; export function summarize() {}' }, message: 'Imports are unavailable' },
    ])('rejects $name', async ({ value, message }) => {
      const result = await grade(problem, { kind: 'code', value } as never);
      expect(result).toMatchObject({ kind: 'code', status: 'invalid-answer', message: expect.stringContaining(message) });
    });

    it('reports a runner error such as the timeout as invalid, not as a score', async () => {
      const stopped = createCodeGrader(async () => ({ error: 'Stopped after 2 seconds. Look for a loop that never ends.' }));
      expect(await stopped(problem, { kind: 'code', value: problem.reference }))
        .toEqual({ kind: 'code', status: 'invalid-answer', message: 'Stopped after 2 seconds. Look for a loop that never ends.' });
    });
  });

  describe('Python answers', () => {
    const python = { language: 'python', source: 'def summarize(xs):\n    return {"total": sum(xs), "items": list(xs)}\n' } as const;
    const pass = (request: { vectors: Array<{ visible: boolean }> }) =>
      ({ checks: request.vectors.map(({ visible }) => (visible ? { visible, passed: true, logs: [], actual: null } : { visible, passed: false })) });

    it('go to the Python runner with every vector on Submit, never to the JS runner', async () => {
      const js = vi.fn(evaluateCode);
      const runPython = vi.fn(async (request: Parameters<typeof pass>[0]) => pass(request));
      const result = await createCodeGrader(js, runPython)(problem, { kind: 'code', value: python });
      expect(js).not.toHaveBeenCalled();
      expect(runPython).toHaveBeenCalledOnce();
      const request = runPython.mock.calls[0][0] as Record<string, unknown>;
      expect(request).toMatchObject({ source: python.source, exportName: 'summarize' });
      expect(request).not.toHaveProperty('language');
      expect((request.vectors as Array<{ visible: boolean }>).map(({ visible }) => visible)).toEqual([true, true, true, false, false]);
      // The fake fails both hidden vectors, so the grade comes from the runner's checks: 3 of 5.
      expect(result).toMatchObject({ kind: 'code', status: 'graded', score: 3 / 5 });
    });

    it('run only the visible vectors in run mode', async () => {
      const runPython = vi.fn(async (request: Parameters<typeof pass>[0]) => pass(request));
      const { result } = await checkCode(problem, { kind: 'code', value: python }, evaluateCode, 'run', runPython);
      expect(runPython.mock.calls[0][0].vectors).toHaveLength(3);
      expect(result).toMatchObject({ status: 'graded', score: 1 });
    });

    it('report a Python runner error such as the timeout as invalid, not as a score', async () => {
      const stopped = createCodeGrader(evaluateCode, async () => ({ error: 'Stopped after 2 seconds. Look for a loop that never ends.' }));
      expect(await stopped(problem, { kind: 'code', value: python }))
        .toEqual({ kind: 'code', status: 'invalid-answer', message: 'Stopped after 2 seconds. Look for a loop that never ends.' });
    });

    it('reject empty Python source before running it', async () => {
      const runPython = vi.fn(async (request: Parameters<typeof pass>[0]) => pass(request));
      const result = await createCodeGrader(evaluateCode, runPython)(problem, { kind: 'code', value: { language: 'python', source: '  ' } });
      expect(result).toMatchObject({ status: 'invalid-answer', message: expect.stringContaining('Enter a solution') });
      expect(runPython).not.toHaveBeenCalled();
    });
  });

  it('compiles TypeScript before running it', async () => {
    const source = 'type Sum = { total: number; items: number[] };\nexport function summarize(xs: number[]): Sum { return { items: [...xs], total: xs.reduce((a, b) => a + b, 0) }; }';
    expect(await submit(source, 'ts')).toMatchObject({ status: 'graded', score: 1 });
  });
});
