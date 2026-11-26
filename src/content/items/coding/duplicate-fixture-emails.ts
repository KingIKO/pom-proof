import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'duplicate-fixture-emails',
  title: 'Find duplicate fixture emails',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Strings', 'Sets', 'Test data'],
  roles: ['automation', 'sdet', 'manual'],
  summary: 'Flag mismatched casing and padding in seeded email addresses.',
  prompt: `
A fixture importer treats two email addresses as the same after stripping ordinary spaces from both ends and converting ASCII letters to lowercase. Inputs contain only printable ASCII characters. Ignore entries that become empty. The importer does no other parsing: plus tags, dots, and internal spaces are preserved.

Write \`duplicateFixtureEmails(emails)\`. Return each duplicate normalized string once, in the order it reaches its **second** occurrence.

For \`[" a@qa.test", "b@qa.test", "B@QA.TEST ", "A@qa.test"]\`, the result is \`["b@qa.test", "a@qa.test"]\`.
`,
  fn: 'duplicateFixtureEmails',
  params: [{ name: 'emails', type: 'string[]' }],
  returns: 'string[]',
  cases: [
    { args: [[' a@qa.test', 'b@qa.test', 'B@QA.TEST ', 'A@qa.test']], expected: ["b@qa.test","a@qa.test"] },
    { args: [['ivy@qa.test', ' I V Y@qa.test ', 'ivy+seed@qa.test']], expected: [] },
    { args: [['x@qa.test', 'X@QA.TEST', ' x@qa.test ']], expected: ["x@qa.test"] },
    { args: [['  ', '', ' ']], expected: [], hidden: true },
    { args: [[]], expected: [], hidden: true },
    { args: [['z@qa.test', 'A@qa.test', 'Z@qa.test', ' a@qa.test', 'Z@qa.test']], expected: ["z@qa.test","a@qa.test"], hidden: true },
    { args: [['a.b@qa.test', 'ab@qa.test', ' A.B@qa.test ', 'a b@qa.test']], expected: ["a.b@qa.test"], hidden: true },
  ],
  hints: ['Normalize before looking for a match.', 'Track addresses already seen separately from addresses already reported.'],
  reference: {
    javascript: `function duplicateFixtureEmails(emails) {
  const seen = new Set();
  const duplicates = new Set();
  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (email === '') continue;
    if (seen.has(email)) duplicates.add(email);
    seen.add(email);
  }
  return [...duplicates];
}`,
    python: `def duplicate_fixture_emails(emails):
    seen = set()
    duplicates = {}
    for raw in emails:
        email = raw.strip(" ").lower()
        if not email:
            continue
        if email in seen:
            duplicates[email] = None
        seen.add(email)
    return list(duplicates)`,
  },
  solutionNotes: 'A JavaScript Set iterates in insertion order. Use a dict for the same job in Python. Once a duplicate is recorded, later occurrences do not move it.',
  interviewNotes: 'Call out that case folding is the fixture importer’s rule. Which input distinguishes first-occurrence order from second-occurrence order?',
};

export default item;
