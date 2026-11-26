import type { MutationItem } from '../../types';

const implementation = `function mergeTestOutcomes(attempts) {
  const chosen = new Map();
  for (const row of attempts) {
    const key = row.id;
    const previous = chosen.get(key);
    if (!previous || row.attempt >= previous.attempt) chosen.set(key, row);
  }
  return [...chosen.values()]
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    .map(({ id, attempt, status }) => ({ id, attempt, status }));
}`;

const item: MutationItem = {
  id: 'merge-test-outcomes',
  title: 'Test how retry results are merged',
  kind: 'mutation',
  subject: 'function',
  difficulty: 'Medium',
  topics: ['CI', 'State transitions', 'Mutation testing'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Test which execution wins when reports arrive out of order.',
  prompt: 'Write tests for the report aggregator. A test must pass on the real code and at least one test must fail for each planted bug to earn the full mutation score.',
  contract: `
\`mergeTestOutcomes(attempts)\` receives rows with a case-sensitive ASCII \`id\`, positive integer \`attempt\`, and lowercase \`status\` of \`"passed"\`, \`"failed"\`, or \`"skipped"\`. Rows may also carry unrelated metadata.

- Return one result per ID. Use the row with the highest numeric attempt, regardless of its status or arrival order.
- If two rows have the same ID and attempt, the later input row wins.
- Return only the \`id\`, \`attempt\`, and \`status\` fields. Sort results by ID in ascending ASCII order.
- An empty report returns an empty array.
`,
  implementation,
  mutants: [
    { id: 'last-arrival', label: 'A late report from an earlier attempt overwrites the newer attempt.', code: implementation.replace('!previous || row.attempt >= previous.attempt', 'true') },
    { id: 'early-tie', label: 'The first row wins when duplicate reports have the same attempt number.', code: implementation.replace('row.attempt >= previous.attempt', 'row.attempt > previous.attempt') },
    { id: 'folded-id', label: 'Results for IDs that differ only by case are merged.', code: implementation.replace('const key = row.id;', 'const key = row.id.toLowerCase();') },
    { id: 'arrival-order', label: 'Results are returned in insertion order instead of being sorted by ID.', code: implementation.replace('    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)\n', '') },
    { id: 'skip-dropped', label: 'Skipped attempts never get considered for the final result.', code: implementation.replace('    const key = row.id;', "    if (row.status === 'skipped') continue;\n    const key = row.id;") },
    { id: 'metadata-leak', label: 'The result includes extra fields from an input row.', code: implementation.replace('({ id, attempt, status }) => ({ id, attempt, status })', '(row) => ({ ...row })') },
  ],
  starter: `test('A single passing attempt appears in the report', () => {
  const row = { id: 'cart', attempt: 1, status: 'passed' };
  expect(mergeTestOutcomes([row])).toEqual([row]);
});

// TODO: Compare arrival order with attempt order.
// TODO: Check result rows for more than one test ID.`,
  referenceTests: `test('A late report for attempt 2 cannot replace attempt 10', () => {
  const newer = { id: 'cart', attempt: 10, status: 'passed' };
  const older = { id: 'cart', attempt: 2, status: 'failed' };
  expect(mergeTestOutcomes([newer, older])).toEqual([newer]);
});

test('On equal attempts the later report wins', () => {
  const early = { id: 'cart', attempt: 2, status: 'passed' };
  const late = { id: 'cart', attempt: 2, status: 'failed' };
  expect(mergeTestOutcomes([early, late])).toEqual([late]);
});

test('Distinct case is preserved and IDs sort in ASCII order', () => {
  const lower = { id: 'cart', attempt: 4, status: 'failed' };
  const upper = { id: 'Cart', attempt: 1, status: 'passed' };
  expect(mergeTestOutcomes([lower, upper])).toEqual([upper, lower]);
});

test('A skipped attempt can supersede a failure', () => {
  const fail = { id: 'cart', attempt: 2, status: 'failed' };
  const skip = { id: 'cart', attempt: 3, status: 'skipped' };
  expect(mergeTestOutcomes([fail, skip])).toEqual([skip]);
});

test('Result rows contain only contract fields', () => {
  expect(mergeTestOutcomes([{ id: 'cart', attempt: 1, status: 'failed', worker: 'west' }]))
    .toEqual([{ id: 'cart', attempt: 1, status: 'failed' }]);
  expect(mergeTestOutcomes([])).toEqual([]);
});`,
  solutionNotes: 'Compare the winning row in full. An assertion on only its ID would miss the wrong attempt or status. Use both unordered arrivals and duplicate attempt numbers because their tie rules differ.',
  interviewNotes: 'Explain why arrival time and attempt number need separate tests. How would you test a version that merges reports from several branches?',
};

export default item;
