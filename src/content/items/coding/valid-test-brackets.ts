import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'valid-test-brackets',
  title: 'Check bracket nesting in a filter',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Strings', 'Stacks'],
  roles: ['automation', 'sdet'],
  summary: 'Catch incomplete or crossed brackets before a test filter is run.',
  prompt: `
The text field for a test filter checks bracket nesting before it parses the rest of the filter. Write \`hasBalancedBrackets(filter)\` to check round, square, and curly brackets.

An opener must match the next closer at its own nesting level. Ignore every other character, including quotes. Text with no brackets is balanced.

\`suite[group(smoke)]\` is balanced. \`suite[(smoke])\` is not.
`,
  fn: 'hasBalancedBrackets',
  params: [{ name: 'filter', type: 'string' }],
  returns: 'boolean',
  cases: [
    { args: ['suite[group(smoke)]'], expected: true },
    { args: ['suite[(smoke])'], expected: false },
    { args: ['(unit) {smoke}[api]'], expected: true },
    { args: [''], expected: true, hidden: true },
    { args: ['quick smoke'], expected: true, hidden: true },
    { args: [']a['], expected: false, hidden: true },
    { args: ['{[ok]'], expected: false, hidden: true },
    { args: ['"("'], expected: false, hidden: true },
  ],
  hints: ['The most recent unmatched opener determines which closer is legal.', 'After processing all characters, check whether any openers remain.'],
  reference: {
    javascript: `function hasBalancedBrackets(filter) {
  const openings = '([{';
  const closings = ')]}';
  const stack = [];
  for (const ch of filter) {
    if (openings.includes(ch)) stack.push(ch);
    const close = closings.indexOf(ch);
    if (close >= 0 && stack.pop() !== openings[close]) return false;
  }
  return stack.length === 0;
}`,
    python: `def has_balanced_brackets(filter):
    matches = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in filter:
        if ch in "([{":
            stack.append(ch)
        elif ch in matches:
            if not stack or stack.pop() != matches[ch]:
                return False
    return not stack`,
  },
  solutionNotes: 'A stack records the open brackets that still need a match. Counting brackets by kind misses crossed pairs such as `[(])`.',
  interviewNotes: 'Give a counterexample to a counter-only solution. How would quoted literals with escape sequences change the rules and the tests?',
};

export default item;
