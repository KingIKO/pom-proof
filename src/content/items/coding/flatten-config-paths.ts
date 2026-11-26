import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'flatten-config-paths',
  title: 'Flatten test configuration paths',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['JSON', 'Trees', 'Recursion'],
  roles: ['automation', 'sdet'],
  summary: 'List each configuration leaf beside its dot-separated path.',
  prompt: `
Write \`flattenConfigPaths(config)\` to list the leaves of a JSON configuration object as \`[path, value]\` pairs. Walk nested objects by key and arrays by zero-based index. Separate path segments with dots.

- Keys contain only ASCII letters, digits, underscores, and hyphens, and are never empty.
- Strings, numbers, booleans, null, and empty nested containers are leaves. An empty root object gives an empty list.
- Sort the pairs by path in ascending ASCII order. Leave the input unchanged.

For \`{"browser":{"sizes":[800, 1024]},"flags":{}}\`, return \`[["browser.sizes.0",800],["browser.sizes.1",1024],["flags",{}]]\`.
`,
  fn: 'flattenConfigPaths',
  params: [{ name: 'config', type: 'Record<string, unknown>' }],
  returns: '[string, unknown][]',
  cases: [
    { args: [{ browser: { sizes: [800, 1024] }, flags: {} }], expected: [["browser.sizes.0",800],["browser.sizes.1",1024],["flags",{}]] },
    { args: [{ z: true, a: { mode: null, retries: 0 } }], expected: [["a.mode",null],["a.retries",0],["z",true]] },
    { args: [{}], expected: [] },
    { args: [{ cases: [{ enabled: false }, [], null, { label: '' }] }], expected: [["cases.0.enabled",false],["cases.1",[]],["cases.2",null],["cases.3.label",""]], hidden: true },
    { args: [{ A: 1, a: 2, '9': 3, '10': 4, '2': 5 }], expected: [["10",4],["2",5],["9",3],["A",1],["a",2]], hidden: true },
    { args: [{ constructor: { toString: [] }, data: { ['__proto__']: false } }], expected: [["constructor.toString",[]],["data.__proto__",false]], hidden: true },
    { args: [{ values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }], expected: [["values.0",0],["values.1",1],["values.10",10],["values.2",2],["values.3",3],["values.4",4],["values.5",5],["values.6",6],["values.7",7],["values.8",8],["values.9",9]], hidden: true },
  ],
  hints: ['Carry the current path as you visit each child.', 'Check for empty containers before descending, so they appear in the result.'],
  reference: {
    javascript: `function flattenConfigPaths(config) {
  const pairs = [];
  function visit(value, path) {
    const entries = value !== null && typeof value === 'object' ? Object.entries(value) : [];
    if (!entries.length && path !== '') pairs.push([path, value]);
    for (const [key, child] of entries) visit(child, path ? path + '.' + key : key);
  }
  visit(config, '');
  return pairs.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
}`,
    python: `def flatten_config_paths(config):
    pairs = []
    def visit(value, path):
        if isinstance(value, dict) and value:
            entries = value.items()
        elif isinstance(value, list) and value:
            entries = enumerate(value)
        else:
            if path:
                pairs.append([path, value])
            return
        for key, child in entries:
            key = str(key)
            visit(child, path + "." + key if path else key)
    visit(config, "")
    return sorted(pairs, key=lambda pair: pair[0])`,
  },
  solutionNotes: 'Visit each node once and sort the leaves by the complete path. Lexical order places `values.10` before `values.2`. That is separate from the order used to visit the array.',
  interviewNotes: 'Ask what should happen when a key contains a dot. What input would expose an implementation that silently drops empty arrays?',
};

export default item;
