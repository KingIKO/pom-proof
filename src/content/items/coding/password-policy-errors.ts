import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'password-policy-errors',
  title: 'List password policy errors',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Strings', 'Validation', 'Boundary values'],
  roles: ['automation', 'sdet', 'manual'],
  summary: 'Return every violation of a signup form policy in display order.',
  prompt: `
Write \`passwordPolicyErrors(password)\` for a mock signup form. The input contains only ASCII characters. Do not trim it.

Return an array of error codes in this order. Include every applicable code:

1. \`LENGTH\` if the password has fewer than 8 or more than 16 characters.
2. \`UPPERCASE\` if it contains no letter A through Z.
3. \`DIGIT\` if it contains no digit 0 through 9.
4. \`WHITESPACE\` if it contains a space, tab, line feed, carriage return, vertical tab, or form feed.

Return an empty array if no rule is broken.
`,
  fn: 'passwordPolicyErrors',
  params: [{ name: 'password', type: 'string' }],
  returns: 'string[]',
  cases: [
    { args: ['BlueF0g?'], expected: [] },
    { args: ['bluefog'], expected: ["LENGTH","UPPERCASE","DIGIT"] },
    { args: ['Blue fog'], expected: ["DIGIT","WHITESPACE"] },
    { args: [''], expected: ["LENGTH","UPPERCASE","DIGIT"], hidden: true },
    { args: ['A123456789012345'], expected: [], hidden: true },
    { args: ['A1234567890123456'], expected: ["LENGTH"], hidden: true },
    { args: ['lower7\tmark'], expected: ["UPPERCASE","WHITESPACE"], hidden: true },
  ],
  hints: ['Check each rule independently so several errors can be returned.', 'Add codes in the specified order instead of sorting them.'],
  reference: {
    javascript: `function passwordPolicyErrors(password) {
  const errors = [];
  if (password.length < 8 || password.length > 16) errors.push('LENGTH');
  if (!/[A-Z]/.test(password)) errors.push('UPPERCASE');
  if (!/[0-9]/.test(password)) errors.push('DIGIT');
  if (/[ \\t\\n\\r\\v\\f]/.test(password)) errors.push('WHITESPACE');
  return errors;
}`,
    python: `def password_policy_errors(password):
    errors = []
    if not 8 <= len(password) <= 16:
        errors.append("LENGTH")
    if not any("A" <= c <= "Z" for c in password):
        errors.append("UPPERCASE")
    if not any("0" <= c <= "9" for c in password):
        errors.append("DIGIT")
    if any(c in " \\t\\n\\r\\v\\f" for c in password):
        errors.append("WHITESPACE")
    return errors`,
  },
  solutionNotes: 'Independent checks preserve all errors. At most four scans are needed, so time is linear in the input length.',
  interviewNotes: 'Explain why error order might matter to the form. Which lengths would you test to distinguish inclusive endpoints from exclusive ones?',
};

export default item;
