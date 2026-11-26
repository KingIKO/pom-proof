import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'stable-unique-test-ids',
  title: 'Keep the first copy of each test ID',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Arrays', 'Sets'],
  roles: ['automation', 'sdet'],
  summary: 'Combine test selections while preserving the order of first appearance.',
  prompt: `
Several parts of a CI job add IDs to the same test selection. Write \`uniqueTestIds(ids)\` to return each string once, in first-appearance order.

Use exact string equality. Do not trim, change case, or discard empty IDs. Return an array and leave the input unchanged.

For \`["db", "auth", "db", "ui", "auth"]\`, return \`["db", "auth", "ui"]\`.
`,
  fn: 'uniqueTestIds',
  params: [{ name: 'ids', type: 'string[]' }],
  returns: 'string[]',
  cases: [
    { args: [['db', 'auth', 'db', 'ui', 'auth']], expected: ["db","auth","ui"] },
    { args: [['API', 'api', 'API']], expected: ["API","api"] },
    { args: [['receipt', 'billing', 'audit']], expected: ["receipt","billing","audit"] },
    { args: [[]], expected: [], hidden: true },
    { args: [['', '', ' ', '']], expected: [""," "], hidden: true },
    { args: [['10', '2', '1', '2']], expected: ["10","2","1"], hidden: true },
    { args: [['constructor', '__proto__', 'constructor', 'constructor ']], expected: ["constructor","__proto__","constructor "], hidden: true },
  ],
  hints: ['Membership checking is separate from output order.', 'Use a lookup that cannot mistake an inherited property for a test ID.'],
  reference: {
    javascript: `function uniqueTestIds(ids) {
  return [...new Set(ids)];
}`,
    python: `def unique_test_ids(ids):
    return list(dict.fromkeys(ids))`,
  },
  solutionNotes: 'JavaScript Set and Python dict keep the order in which a value first enters the collection. In a language with an unordered set, append to a second list on each successful first insertion.',
  interviewNotes: 'Explain why sorting before deduplication breaks the contract. How would you test an implementation that keeps the last copy?',
};

export default item;
