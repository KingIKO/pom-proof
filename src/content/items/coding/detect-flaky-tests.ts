import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'detect-flaky-tests',
  title: 'Find inconsistent results on the same commit',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['Hash maps', 'CI', 'Flaky tests'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Report test and commit pairs that recorded both a pass and a fail.',
  prompt: `
Write \`detectFlakyTests(runs)\` to flag pairs of test name and commit ID that recorded at least one pass and one fail. The input is unsorted and may contain repeated rows. Treat names and commit IDs as case-sensitive ASCII strings. A skip is neither a pass nor a fail.

Return one \`{ test, commit }\` per flagged pair. Sort by test name, then by commit ID, in ascending ASCII order.

A pass for \`checkout\` on commit \`c1\` and a fail on \`c2\` do not flag either commit. A separate fail on \`c1\` flags only \`{ test: "checkout", commit: "c1" }\`.
`,
  fn: 'detectFlakyTests',
  params: [{ name: 'runs', type: `{ test: string; commit: string; status: 'pass' | 'fail' | 'skip' }[]` }],
  returns: '{ test: string; commit: string }[]',
  cases: [
    { args: [[{ test: 'checkout', commit: 'c1', status: 'pass' }, { test: 'checkout', commit: 'c2', status: 'fail' }, { test: 'checkout', commit: 'c1', status: 'fail' }]], expected: [{"test":"checkout","commit":"c1"}] },
    { args: [[{ test: 'cart', commit: 'c1', status: 'fail' }, { test: 'cart', commit: 'c1', status: 'skip' }]], expected: [] },
    { args: [[{ test: 'search', commit: 'c1', status: 'fail' }, { test: 'search', commit: 'c1', status: 'pass' }, { test: 'search', commit: 'c1', status: 'fail' }]], expected: [{"test":"search","commit":"c1"}] },
    { args: [[]], expected: [], hidden: true },
    { args: [[{ test: 'a:b', commit: 'c', status: 'pass' }, { test: 'a', commit: 'b:c', status: 'fail' }]], expected: [], hidden: true },
    { args: [[{ test: 'A', commit: 'c1', status: 'pass' }, { test: 'a', commit: 'c1', status: 'fail' }, { test: 'A', commit: 'C1', status: 'fail' }]], expected: [], hidden: true },
    { args: [[{ test: 'z', commit: 'c', status: 'pass' }, { test: 'a', commit: 'c2', status: 'fail' }, { test: 'z', commit: 'c', status: 'fail' }, { test: 'a', commit: 'c2', status: 'pass' }, { test: 'a', commit: 'c1', status: 'pass' }, { test: 'a', commit: 'c1', status: 'fail' }]], expected: [{"test":"a","commit":"c1"},{"test":"a","commit":"c2"},{"test":"z","commit":"c"}], hidden: true },
  ],
  hints: ['Group by both test and commit. A delimiter inside a name must not merge two groups.', 'Each group only needs to remember whether it saw a pass and whether it saw a fail.'],
  reference: {
    javascript: `function detectFlakyTests(runs) {
  const byTest = new Map();
  for (const { test, commit, status } of runs) {
    if (status === 'skip') continue;
    if (!byTest.has(test)) byTest.set(test, new Map());
    const commits = byTest.get(test);
    const bit = status === 'pass' ? 1 : 2;
    commits.set(commit, (commits.get(commit) ?? 0) | bit);
  }
  const flagged = [];
  for (const test of [...byTest.keys()].sort()) {
    const commits = byTest.get(test);
    for (const commit of [...commits.keys()].sort()) {
      if (commits.get(commit) === 3) flagged.push({ test, commit });
    }
  }
  return flagged;
}`,
    python: `def detect_flaky_tests(runs):
    results = {}
    for row in runs:
        if row["status"] != "skip":
            pair = (row["test"], row["commit"])
            results.setdefault(pair, set()).add(row["status"])
    return [
        {"test": test, "commit": commit}
        for (test, commit), statuses in sorted(results.items())
        if statuses == {"pass", "fail"}
    ]`,
  },
  solutionNotes: 'A nested map or tuple key keeps the two grouping fields separate. A two-bit mask or set tracks which outcomes occurred. Sorting gives deterministic reports regardless of arrival order.',
  interviewNotes: 'A mixed result is a signal, and may come from environment changes within a commit. What grouping field would you add to compare runs on the same browser?',
};

export default item;
