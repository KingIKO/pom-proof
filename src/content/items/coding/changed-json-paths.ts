import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'changed-json-paths',
  title: 'Report changed JSON paths',
  kind: 'coding',
  difficulty: 'Hard',
  topics: ['JSON', 'Trees', 'Diffing'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Explain where two nested API snapshots differ using JSON Pointer paths.',
  prompt: `
Write \`changedJsonPaths(before, after)\` to list the locations that changed between two JSON snapshots.

- Compare objects by key, ignoring key order. Compare arrays by zero-based index. Adding an item may therefore change later positions.
- If an object key or array position exists on only one side, report its path once. Do not report anything inside that added or removed value.
- If two values at the same path have different JSON types, report that path once. Otherwise report unequal primitives and recurse into matching container types. Booleans and numbers are distinct types. Numbers are finite and use ordinary numeric equality.
- Use JSON Pointer paths. The root is the empty string. Prefix every segment with \`/\`, replacing \`~\` with \`~0\` and then \`/\` with \`~1\` inside the segment. Keys can be empty and contain any printable ASCII characters.
- Sort the encoded paths in ascending ASCII order. Return an empty array if nothing changed.

Comparing \`{"meta":{"a/b":1},"rows":[true]}\` with \`{"rows":[false,7],"meta":{"a/b":1,"~":null}}\` gives \`["/meta/~0","/rows/0","/rows/1"]\`.
`,
  fn: 'changedJsonPaths',
  params: [{ name: 'before', type: 'unknown' }, { name: 'after', type: 'unknown' }],
  returns: 'string[]',
  cases: [
    { args: [{ meta: { 'a/b': 1 }, rows: [true] }, { rows: [false, 7], meta: { 'a/b': 1, '~': null } }], expected: ["/meta/~0","/rows/0","/rows/1"] },
    { args: [{ left: { x: 2 }, keep: 'ok' }, { keep: 'ok', right: { y: 3 } }], expected: ["/left","/right"] },
    { args: [{ a: { b: 1, c: 2 } }, { a: { c: 2, b: 1 } }], expected: [] },
    { args: [[1, 2], { '0': 1, '1': 2 }], expected: [""], hidden: true },
    { args: [{ '': { '~1/': 1 }, 'a/b': 2 }, { '': { '~1/': 2 }, 'a/b': 3 }], expected: ["//~01~1","/a~1b"], hidden: true },
    { args: [{ data: { count: 0 }, result: false }, { data: null, result: 0 }], expected: ["/data","/result"], hidden: true },
    { args: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [0]], expected: ["/1","/10","/2","/3","/4","/5","/6","/7","/8","/9"], hidden: true },
    { args: [{ ['__proto__']: null, old: { lost: true } }, { constructor: null, new: [{ gained: true }] }], expected: ["/__proto__","/constructor","/new","/old"], hidden: true },
  ],
  hints: ['Check for missing children before comparing any child values. A missing key differs from a present null.', 'Escape each segment before joining it to its parent path. Sort the encoded paths, not the raw keys.'],
  reference: {
    javascript: `function changedJsonPaths(before, after) {
  const changed = [];
  const pending = [[before, after, '']];
  const kind = (value) => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const escape = (key) => key.replaceAll('~', '~0').replaceAll('/', '~1');
  while (pending.length) {
    const [a, b, path] = pending.pop();
    if (a === b) continue;
    const type = kind(a);
    if (type !== kind(b) || (type !== 'object' && type !== 'array')) {
      changed.push(path);
      continue;
    }
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const child = path + '/' + escape(key);
      if (!Object.hasOwn(a, key) || !Object.hasOwn(b, key)) changed.push(child);
      else pending.push([a[key], b[key], child]);
    }
  }
  return changed.sort();
}`,
    python: `def changed_json_paths(before, after):
    changed = []
    pending = [(before, after, "")]

    def kind(value):
        return float if type(value) in (int, float) else type(value)

    def entries(value):
        return value if isinstance(value, dict) else {str(i): v for i, v in enumerate(value)}

    while pending:
        a, b, path = pending.pop()
        if kind(a) != kind(b):
            changed.append(path)
        elif isinstance(a, (dict, list)):
            left, right = entries(a), entries(b)
            for key in left.keys() | right.keys():
                child = path + "/" + key.replace("~", "~0").replace("/", "~1")
                if key in left and key in right:
                    pending.append((left[key], right[key], child))
                else:
                    changed.append(child)
        elif a != b:
            changed.append(path)
    return sorted(changed)`,
  },
  solutionNotes: 'Keep pending pairs with their current path. Matching containers contribute the union of their child keys. Compare only shared children and report a single path for everything present on just one side.',
  interviewNotes: 'Explain why index-based comparison has noisy results for an insertion near the front of an array. How would you test a second mode that compares records by ID?',
};

export default item;
