import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'junit-status-counts',
  title: 'Count test report statuses',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Arrays', 'Test reporting'],
  roles: ['automation', 'sdet', 'manual'],
  summary: 'Turn rows from a test report into pass, fail, and skip counts.',
  prompt: `
A report reader already pulled test rows out of a JUnit XML file. Each row has a name and a lowercase status. Write \`countTestStatuses(rows)\` to turn those rows into a summary.

- Count \`passed\`, \`failed\`, and \`skipped\`. Return all three keys, including counts of zero.
- Count \`error\` as \`failed\`. Ignore any other status.
- Each row is one execution. Count repeated names separately.
`,
  fn: 'countTestStatuses',
  params: [{ name: 'rows', type: '{ name: string; status: string }[]' }],
  returns: '{ passed: number; failed: number; skipped: number }',
  cases: [
    { args: [[{ name: 'opens cart', status: 'passed' }, { name: 'saves cart', status: 'failed' }]], expected: {"passed":1,"failed":1,"skipped":0} },
    { args: [[{ name: 'refund', status: 'error' }, { name: 'checkout', status: 'skipped' }]], expected: {"passed":0,"failed":1,"skipped":1} },
    { args: [[]], expected: {"passed":0,"failed":0,"skipped":0} },
    { args: [[{ name: 'export', status: 'failed' }, { name: 'export', status: 'passed' }]], expected: {"passed":1,"failed":1,"skipped":0}, hidden: true },
    { args: [[{ name: 'offline', status: 'skipped' }, { name: 'offline', status: 'skipped' }]], expected: {"passed":0,"failed":0,"skipped":2}, hidden: true },
    { args: [[{ name: 'refresh', status: 'queued' }, { name: 'restore', status: 'passed' }]], expected: {"passed":1,"failed":0,"skipped":0}, hidden: true },
    { args: [[{ name: '', status: 'failed' }, { name: '', status: 'error' }]], expected: {"passed":0,"failed":2,"skipped":0}, hidden: true },
  ],
  hints: ['Start with all three counters set to zero.', 'Handle failed and error in the same branch.'],
  reference: {
    javascript: `function countTestStatuses(rows) {
  const counts = { passed: 0, failed: 0, skipped: 0 };
  for (const { status } of rows) {
    if (status === 'passed') counts.passed++;
    else if (status === 'skipped') counts.skipped++;
    else if (status === 'failed' || status === 'error') counts.failed++;
  }
  return counts;
}`,
    python: `def count_test_statuses(rows):
    counts = {"passed": 0, "failed": 0, "skipped": 0}
    for row in rows:
        status = row["status"]
        if status == "error":
            status = "failed"
        if status in counts:
            counts[status] += 1
    return counts`,
  },
  solutionNotes: 'Scan the rows once. The summary has a fixed shape and uses constant extra space. Test names are irrelevant to the count.',
  interviewNotes: 'Explain why a repeated name can represent a second execution. How would the cases change if the report used only the final attempt?',
};

export default item;
