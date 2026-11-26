import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'deep-equal-json',
  title: 'Compare JSON response bodies',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['JSON', 'Trees', 'Type comparisons'],
  roles: ['automation', 'sdet'],
  summary: 'Compare nested responses while ignoring the order of object keys.',
  prompt: `
Write \`deepEqualJson(left, right)\` to compare parsed JSON response bodies.

- An object matches if both objects have the same keys and the values match recursively. Object key order never matters.
- An array matches if both arrays have the same length and matching values at each index. Array order matters.
- A string, number, boolean, or null matches only the same JSON type and value. Booleans are distinct from numbers. Numbers are finite and use ordinary numeric equality.
- Different JSON types never match. A missing key differs from a present key with value null.

Inputs contain only JSON values. No cycles, NaN, or undefined appear.
`,
  fn: 'deepEqualJson',
  params: [{ name: 'left', type: 'unknown' }, { name: 'right', type: 'unknown' }],
  returns: 'boolean',
  cases: [
    { args: [{ count: 1, data: { tags: ['qa'], active: false } }, { data: { active: false, tags: ['qa'] }, count: 1 }], expected: true },
    { args: [[1, 2], [2, 1]], expected: false },
    { args: [{ end: null }, {}], expected: false },
    { args: [true, 1], expected: false, hidden: true },
    { args: [{ '0': 'a' }, ['a']], expected: false, hidden: true },
    { args: [null, null], expected: true, hidden: true },
    { args: [[{ x: 1 }], [{ x: '1' }]], expected: false, hidden: true },
    { args: [{ ['__proto__']: null }, { constructor: null }], expected: false, hidden: true },
  ],
  hints: ['Check whether you have an array, object, or primitive before checking values.', 'Count object keys and check that each key is actually present on both objects.'],
  reference: {
    javascript: `function deepEqualJson(left, right) {
  const pending = [[left, right]];
  while (pending.length) {
    const [a, b] = pending.pop();
    if (a === b) continue;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (const key of keys) {
      if (!Object.hasOwn(b, key)) return false;
      pending.push([a[key], b[key]]);
    }
  }
  return true;
}`,
    python: `def deep_equal_json(left, right):
    pending = [(left, right)]
    while pending:
        a, b = pending.pop()
        if type(a) in (int, float) and type(b) in (int, float):
            if a != b:
                return False
            continue
        if type(a) is not type(b):
            return False
        if isinstance(a, dict):
            if a.keys() != b.keys():
                return False
            pending.extend((a[key], b[key]) for key in a)
        elif isinstance(a, list):
            if len(a) != len(b):
                return False
            pending.extend(zip(a, b))
        elif a != b:
            return False
    return True`,
  },
  solutionNotes: 'Keep pairs of values that still need to be compared. Explicit type checks prevent JavaScript coercion and Python’s `True == 1` from changing the result. Comparing serialized strings directly would make object key order significant.',
  interviewNotes: 'Explain which comparison rules come from JSON and which come from the test oracle. What changes when a service declares that a particular array is unordered?',
};

export default item;
