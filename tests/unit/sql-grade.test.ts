import { join } from 'node:path';
import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import type { Problem } from '../../src/lib/contracts';
import { checkSql, createSqlGrader } from '../../src/engines/sql/grade';
import { createSqlRunner, hasOutputOrder, sameRows } from '../../src/runners/sql';
import { root } from '../support/problems';

const runner = createSqlRunner(() => initSqlJs({ locateFile: (file) => join(root, 'node_modules', 'sql.js', 'dist', file) }));
const grade = createSqlGrader(runner);

const problem: Problem<'sql'> = {
  id: 'sql/unit-sample',
  kind: 'sql',
  title: 'Unit sample',
  topic: 'reporting',
  difficulty: 'easy',
  minutes: 1,
  roles: ['sdet'],
  schema: 'CREATE TABLE runs (id INTEGER PRIMARY KEY, name TEXT NOT NULL, ms REAL NOT NULL);',
  seed: "INSERT INTO runs VALUES (1, 'checkout', 1000), (2, 'pickup', 250), (3, 'checkout', 2000);",
  alteredSeed: "INSERT INTO runs VALUES (7, 'refund', 10), (8, 'amend', 20), (9, 'refund', 40);",
  reference: { query: 'SELECT name, AVG(ms) AS avg_ms FROM runs GROUP BY name ORDER BY name;' },
  decoy: { query: 'SELECT name, MAX(ms) AS avg_ms FROM runs GROUP BY name ORDER BY name;' },
};
const unordered: Problem<'sql'> = { ...problem, reference: { query: 'SELECT name FROM runs GROUP BY name;' } };

const ask = (query: string, target = problem) => grade(target, { kind: 'sql', value: { query } });
const datasets = async (query: string, target = problem) =>
  ((await ask(query, target)) as { details: { datasets: Array<{ name: string; passed: boolean }> } }).details.datasets;

describe('SQL grader', () => {
  it('gives the reference full marks on both datasets', async () => {
    expect(await ask(problem.reference.query)).toEqual({
      kind: 'sql',
      status: 'graded',
      score: 1,
      details: { datasets: [{ name: 'seed', passed: true }, { name: 'altered-seed', passed: true }] },
    });
  });

  it('gives the decoy no marks', async () => {
    expect(await ask(problem.decoy.query)).toMatchObject({ status: 'graded', score: 0 });
  });

  it('fails a query that hard-codes the visible rows on the second dataset only', async () => {
    const query = "SELECT 'checkout' AS name, 1500.0 AS avg_ms UNION ALL SELECT 'pickup', 250.0 ORDER BY name;";
    expect(await ask(query)).toMatchObject({ status: 'graded', score: 0.5 });
    expect(await datasets(query)).toEqual([{ name: 'seed', passed: true }, { name: 'altered-seed', passed: false }]);
  });

  describe('order sensitivity', () => {
    it('fails the right rows in the wrong order when the reference orders its output', async () => {
      expect(await ask('SELECT name, AVG(ms) FROM runs GROUP BY name ORDER BY name DESC;')).toMatchObject({ score: 0 });
    });

    it('accepts any row order when the reference does not order its output', async () => {
      expect(await ask('SELECT name FROM runs GROUP BY name ORDER BY name DESC;', unordered)).toMatchObject({ score: 1 });
    });

    it('still compares the rows themselves when order is free', async () => {
      expect(await ask('SELECT name FROM runs GROUP BY name LIMIT 1;', unordered)).toMatchObject({ score: 0 });
    });

    it.each([
      { query: 'SELECT a FROM t ORDER BY a', ordered: true },
      { query: 'select a from t order\n  by a', ordered: true },
      { query: 'SELECT a FROM t', ordered: false },
      { query: 'SELECT ROW_NUMBER() OVER (ORDER BY a) FROM t', ordered: false },
      { query: 'SELECT a FROM (SELECT a FROM t ORDER BY a)', ordered: false },
      { query: "SELECT 'ORDER BY' AS a FROM t", ordered: false },
      { query: 'SELECT a FROM t -- ORDER BY a', ordered: false },
      { query: 'SELECT a FROM t /* ORDER BY a */', ordered: false },
      { query: 'SELECT "order" FROM t', ordered: false },
    ])('reads top-level ORDER BY in $query as $ordered', ({ query, ordered }) => {
      expect(hasOutputOrder(query)).toBe(ordered);
    });
  });

  describe('float rounding', () => {
    it('treats values that agree to two decimal places as equal', async () => {
      const target: Problem<'sql'> = { ...problem, reference: { query: 'SELECT 1.0 / 3 AS share;' } };
      expect(await ask('SELECT 0.333 AS share;', target)).toMatchObject({ score: 1 });
      expect(await ask('SELECT 0.334 AS share;', target)).toMatchObject({ score: 1 });
      expect(await ask('SELECT 0.336 AS share;', target)).toMatchObject({ score: 0 });
    });

    it('compares integers and reals by value', () => {
      expect(sameRows({ columns: ['a'], values: [[2]] }, { columns: ['a'], values: [[2.001]] }, true)).toBe(true);
      expect(sameRows({ columns: ['a'], values: [[2]] }, { columns: ['a'], values: [['2']] }, true)).toBe(false);
    });
  });

  it('fails a result with a different number of columns', async () => {
    expect(await ask('SELECT name, AVG(ms), 1 FROM runs GROUP BY name ORDER BY name;')).toMatchObject({ score: 0 });
  });

  describe('invalid answers', () => {
    it.each([
      { name: 'an empty query', query: '  ', message: 'Enter a query' },
      { name: 'a syntax error', query: 'SELEC name FROM runs', message: 'syntax error' },
      { name: 'an unknown table', query: 'SELECT * FROM missing', message: 'no such table' },
      { name: 'two statements', query: 'SELECT 1; SELECT 2;', message: 'Enter one query at a time' },
      { name: 'a statement without rows', query: "UPDATE runs SET name = 'x'", message: '' },
      { name: 'a schema change', query: 'DROP TABLE runs', message: '' },
      { name: 'a write that returns rows', query: "UPDATE runs SET name = 'x' RETURNING name", message: 'readonly' },
    ])('rejects $name', async ({ query, message }) => {
      expect(await ask(query)).toMatchObject({ kind: 'sql', status: 'invalid-answer', message: expect.stringContaining(message) });
    });
  });

  it('shows the visible result table and keeps the hidden dataset out of it', async () => {
    const { table } = await checkSql(problem, { kind: 'sql', value: problem.reference }, runner);
    expect(table).toEqual({ columns: ['name', 'avg_ms'], values: [['checkout', 1500], ['pickup', 250]] });
  });
});
