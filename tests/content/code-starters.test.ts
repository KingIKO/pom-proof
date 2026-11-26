import { describe, expect, it } from 'vitest';
import { pythonName } from '../../src/runners/python-contract';
import { discoverProblems } from '../support/problems';

// The runners call `exportName` in JS and TS and its snake_case form in Python (the brief's
// naming rule), so each starter must already define the function the runner will call.
const code = discoverProblems().filter((problem) => problem.kind === 'code');
const escape = (name: string) => name.replace(/[$]/g, '\\$');

describe('code starters', () => {
  it('exist', () => {
    expect(code.length, 'no code problems').toBeGreaterThan(0);
  });

  it('use the brief\'s Python name: classifyRun becomes classify_run', () => {
    expect(pythonName('classifyRun')).toBe('classify_run');
    expect(pythonName('parseHTTPStatus')).toBe('parse_http_status');
    // The sample's first Python starter used the JS name, which the runner cannot call.
    expect(/^(?:async\s+)?def\s+classify_run\s*\(/m.test('def classifyRun(attempts):\n    return "not-run"\n')).toBe(false);
  });

  it.each(code.map((problem) => [problem.id, problem] as const))('%s defines the function each runner calls', (_id, problem) => {
    if (problem.data.kind !== 'code') throw new Error(`${problem.id} is not a code problem`);
    const { exportName, starters } = problem.data;
    const exported = new RegExp(`export\\s+(?:async\\s+)?(?:function\\s+${escape(exportName)}\\b|const\\s+${escape(exportName)}\\b)`);
    const python = new RegExp(`^(?:async\\s+)?def\\s+${pythonName(exportName)}\\s*\\(`, 'm');
    expect({
      js: exported.test(starters.js),
      ts: exported.test(starters.ts),
      python: python.test(starters.python),
    }, `starters must define ${exportName} (JS, TS) and ${pythonName(exportName)} (Python)`).toEqual({ js: true, ts: true, python: true });
  });
});
