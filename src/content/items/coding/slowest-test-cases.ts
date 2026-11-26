import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'slowest-test-cases',
  title: 'Rank tests by total duration',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['Hash maps', 'Sorting', 'Test reporting'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Find the tests that took the most CI time across all attempts.',
  prompt: `
Write \`slowestTestCases(attempts, limit)\`. Each attempt has a case-sensitive ASCII test name and a nonnegative integer duration in milliseconds. Add every attempt's duration to its test's total, including retries. All totals fit in a safe integer.

Return up to \`limit\` records of the form \`{ test, totalMs }\`, highest total first. Break ties by the test name in ascending ASCII order. The limit is a nonnegative integer.

If \`export\` ran for 40 ms twice and \`search\` ran for 70 ms once, a limit of 1 returns \`[{ test: "export", totalMs: 80 }]\`.
`,
  fn: 'slowestTestCases',
  params: [{ name: 'attempts', type: '{ test: string; ms: number }[]' }, { name: 'limit', type: 'number' }],
  returns: '{ test: string; totalMs: number }[]',
  cases: [
    { args: [[{ test: 'export', ms: 40 }, { test: 'search', ms: 70 }, { test: 'export', ms: 40 }], 1], expected: [{"test":"export","totalMs":80}] },
    { args: [[{ test: 'write', ms: 8 }, { test: 'read', ms: 8 }, { test: 'save', ms: 6 }], 2], expected: [{"test":"read","totalMs":8},{"test":"write","totalMs":8}] },
    { args: [[{ test: 'a', ms: 1 }], 8], expected: [{"test":"a","totalMs":1}] },
    { args: [[], 5], expected: [], hidden: true },
    { args: [[{ test: 'a', ms: 50 }], 0], expected: [], hidden: true },
    { args: [[{ test: 'a', ms: 0 }, { test: 'A', ms: 0 }, { test: 'Z', ms: 0 }], 8], expected: [{"test":"A","totalMs":0},{"test":"Z","totalMs":0},{"test":"a","totalMs":0}], hidden: true },
    { args: [[{ test: 'constructor', ms: 4 }, { test: '__proto__', ms: 12 }, { test: 'constructor', ms: 9 }], 2], expected: [{"test":"constructor","totalMs":13},{"test":"__proto__","totalMs":12}], hidden: true },
  ],
  hints: ['Group the attempts by test name before you rank anything.', 'Build the tie-break into the sort, then take the requested prefix.'],
  reference: {
    javascript: `function slowestTestCases(attempts, limit) {
  const totals = new Map();
  for (const { test, ms } of attempts) totals.set(test, (totals.get(test) ?? 0) + ms);
  return [...totals].map(([test, totalMs]) => ({ test, totalMs }))
    .sort((a, b) => b.totalMs - a.totalMs || (a.test < b.test ? -1 : a.test > b.test ? 1 : 0))
    .slice(0, limit);
}`,
    python: `def slowest_test_cases(attempts, limit):
    totals = {}
    for row in attempts:
        name = row["test"]
        totals[name] = totals.get(name, 0) + row["ms"]
    names = sorted(totals, key=lambda name: (-totals[name], name))
    return [{"test": name, "totalMs": totals[name]} for name in names[:limit]]`,
  },
  solutionNotes: 'Accumulate by name, then sort the distinct tests. For n attempts and k test names, time is O(n + k log k), with O(k) extra space.',
  interviewNotes: 'Total duration and average duration tell different stories about retries. Ask which one the team wants. What would you test if the limit cuts through a tie?',
};

export default item;
