import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'log-word-frequency',
  title: 'Count terms in a log message',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Strings', 'Hash maps'],
  roles: ['automation', 'sdet'],
  summary: 'Count ASCII words regardless of casing or surrounding punctuation.',
  prompt: `
Write \`logWordFrequency(text)\` for a report that counts terms in log messages. A word is a run of one or more ASCII letters or digits. Every other character is a separator. Convert letters to lowercase and return an object mapping each word to its count. An input without words returns an empty object.

For \`"API-500; api/500"\`, the counts are \`{"api": 2, "500": 2}\`. Key order does not matter.
`,
  fn: 'logWordFrequency',
  params: [{ name: 'text', type: 'string' }],
  returns: 'Record<string, number>',
  cases: [
    { args: ['API-500; api/500'], expected: {"500":2,"api":2} },
    { args: ['Passed\tpassed\nSKIP skipped'], expected: {"passed":2,"skip":1,"skipped":1} },
    { args: ['? ... - _'], expected: {} },
    { args: [''], expected: {}, hidden: true },
    { args: ['v2 v2 V02'], expected: {"v2":2,"v02":1}, hidden: true },
    { args: ["can’t CAN'T foo_bar"], expected: {"can":2,"t":2,"foo":1,"bar":1}, hidden: true },
    { args: ['constructor Constructor toString café CAFÉ'], expected: {"constructor":2,"tostring":1,"caf":2}, hidden: true },
  ],
  hints: ['Match runs of ASCII letters and digits before changing case.', 'Treat every token as data, including names that resemble object properties.'],
  reference: {
    javascript: `function logWordFrequency(text) {
  const counts = new Map();
  for (const token of text.match(/[A-Za-z0-9]+/g) ?? []) {
    const word = token.toLowerCase();
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return Object.fromEntries(counts);
}`,
    python: `import re

def log_word_frequency(text):
    counts = {}
    for token in re.findall(r"[A-Za-z0-9]+", text):
        word = token.lower()
        counts[word] = counts.get(word, 0) + 1
    return counts`,
  },
  solutionNotes: 'Keep the token alphabet in the regex explicit. Matching before folding also keeps non-ASCII letters from turning into ASCII tokens. A Map avoids inherited property names in JavaScript.',
  interviewNotes: 'Clarify how punctuation and digits behave before picking a tokenizer. What cases would distinguish this rule from splitting only on spaces?',
};

export default item;
