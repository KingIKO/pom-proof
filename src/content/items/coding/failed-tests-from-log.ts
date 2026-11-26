import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'failed-tests-from-log',
  title: 'Failed tests from a run log',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Strings', 'Parsing'],
  roles: ['automation', 'sdet'],
  summary: 'Parse a CI log and return the names of failed tests, without duplicates.',
  prompt: `
A test runner prints one line per test result:

\`\`\`
[PASS] login > valid credentials (1.2s)
[FAIL] cart > applies discount (0.8s)
[SKIP] search > typo suggestion
\`\`\`

Write \`failedTests(log)\` that returns the names of failed tests in the order they first failed. A name is the text between the status and the duration, trimmed. Retries can print the same failure more than once: return each name once.

Ignore lines that do not start with a status in square brackets.

**Example**

\`\`\`
failedTests("[FAIL] a > b (1s)\\n[PASS] c > d (2s)\\n[FAIL] a > b (1s)")
// ["a > b"]
\`\`\`
`,
  fn: 'failedTests',
  params: [{ name: 'log', type: 'string' }],
  returns: 'string[]',
  cases: [
    { args: ['[FAIL] a > b (1s)\n[PASS] c > d (2s)\n[FAIL] a > b (1s)'], expected: ['a > b'] },
    { args: ['[PASS] login > valid (1.2s)\n[SKIP] search > typo'], expected: [] },
    { args: ['[FAIL] cart > discount (0.8s)\n[FAIL] auth > lockout (3s)'], expected: ['cart > discount', 'auth > lockout'] },
    { args: [''], expected: [], hidden: true },
    { args: ['Starting run...\n[FAIL]   spaced > name   (2s)\nnoise [FAIL] x (1s)'], expected: ['spaced > name'], hidden: true },
    { args: ['[FAIL] no duration\n[FAIL] no duration'], expected: ['no duration'], hidden: true },
  ],
  hints: ['Split on newlines, then match each line with a regular expression that captures the status and the name.', 'A Set keeps first-seen order in both JavaScript and Python 3.7+ dicts.'],
  reference: {
    javascript: `function failedTests(log) {
  const seen = new Set();
  for (const line of log.split('\\n')) {
    const m = line.match(/^\\[(\\w+)\\]\\s*(.*?)\\s*(\\([^)]*\\))?\\s*$/);
    if (m && m[1] === 'FAIL') seen.add(m[2]);
  }
  return [...seen];
}`,
    python: `import re
def failed_tests(log):
    seen = {}
    for line in log.split("\\n"):
        m = re.match(r"^\\[(\\w+)\\]\\s*(.*?)\\s*(\\([^)]*\\))?\\s*$", line)
        if m and m.group(1) == "FAIL":
            seen[m.group(2)] = True
    return list(seen)`,
  },
  solutionNotes: `
Read line by line, match \`[STATUS] name (duration)\` with an optional duration group, and keep a Set of names. Sets keep insertion order, so the first failure decides the position.

The hidden cases check what real logs do: blank input, noise lines, extra spaces and a missing duration. Anchoring the regex at the start of the line (\`^\`) is what rejects \`noise [FAIL] x\`.
`,
  interviewNotes: `
Interviewers use log parsing because it mirrors real QA work. Say your assumptions out loud ("a name never contains a parenthesis") and ask about retries before you code. Mention that you would add a unit test for the regex with the odd lines you just listed.
`,
};

export default item;
