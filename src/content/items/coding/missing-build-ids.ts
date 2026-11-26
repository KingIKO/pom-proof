import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'missing-build-ids',
  title: 'Find missing build IDs',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Arrays', 'Sets', 'Boundary values'],
  roles: ['automation', 'sdet'],
  summary: 'Compare reported build IDs to the expected inclusive range.',
  prompt: `
The build dashboard expects every ID from \`first\` through \`last\`, inclusive. Write \`missingBuildIds(first, last, seen)\` to return the missing IDs in ascending order.

All IDs are integers between 0 and 1,000,000. Reported IDs may arrive out of order, repeat, or fall outside the range. If \`first > last\`, return an empty array.

For \`missingBuildIds(11, 15, [15, 11, 13, 13])\`, return \`[12, 14]\`.
`,
  fn: 'missingBuildIds',
  params: [{ name: 'first', type: 'number' }, { name: 'last', type: 'number' }, { name: 'seen', type: 'number[]' }],
  returns: 'number[]',
  cases: [
    { args: [11, 15, [15, 11, 13, 13]], expected: [12,14] },
    { args: [5, 7, [3, 5, 6, 8]], expected: [7] },
    { args: [4, 4, [4, 4]], expected: [] },
    { args: [3, 2, [2, 3]], expected: [], hidden: true },
    { args: [0, 0, []], expected: [0], hidden: true },
    { args: [0, 2, [1]], expected: [0,2], hidden: true },
    { args: [999997, 1000000, []], expected: [999997,999998,999999,1000000], hidden: true },
  ],
  hints: ['Put the observed IDs in a set before walking the expected range.', 'Include the end of the range in the walk.'],
  reference: {
    javascript: `function missingBuildIds(first, last, seen) {
  const received = new Set(seen);
  const missing = [];
  for (let id = first; id <= last; id++) {
    if (!received.has(id)) missing.push(id);
  }
  return missing;
}`,
    python: `def missing_build_ids(first, last, seen):
    received = set(seen)
    return [build for build in range(first, last + 1) if build not in received]`,
  },
  solutionNotes: 'The set makes each membership check constant time on average. Walking the expected IDs directly gives ascending output without sorting the reports.',
  interviewNotes: 'Use singleton ranges to show that both endpoints are inclusive. What would you change if the caller only needed a count across a huge range?',
};

export default item;
