import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'redact-payment-log',
  title: 'Mask payment fields in a test log',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['Strings', 'Parsing', 'Privacy'],
  roles: ['automation', 'sdet'],
  summary: 'Redact a mock card field without changing surrounding log text.',
  prompt: `
Write \`redactPaymentLog(line)\` for a mock payment service. A field is a run of characters separated by ASCII spaces, tabs, line feeds, carriage returns, vertical tabs, or form feeds.

Mask every field that is exactly \`card=\` followed by 12 to 19 ASCII digits. Replace each digit except the final four with a single \`*\`. Matching is case-sensitive. Keep all separators and other fields verbatim.

For \`order=123 card=123456789012 extra=ok\`, return \`order=123 card=********9012 extra=ok\`. This exercise covers one log format. It does not attempt to classify every form of payment data.
`,
  fn: 'redactPaymentLog',
  params: [{ name: 'line', type: 'string' }],
  returns: 'string',
  cases: [
    { args: ['order=123 card=123456789012 extra=ok'], expected: "order=123 card=********9012 extra=ok" },
    { args: ['card=000000000001\tcard=0000000000000000002'], expected: "card=********0001\tcard=***************0002" },
    { args: ['card=123456 card=123456789012, other=123456789012'], expected: "card=123456 card=123456789012, other=123456789012" },
    { args: [''], expected: "", hidden: true },
    { args: ['Card=123456789012 my-card=123456789012 card=12345678901234567890'], expected: "Card=123456789012 my-card=123456789012 card=12345678901234567890", hidden: true },
    { args: ['\t card=000000000012\ncard=12345678901 card=000000000013\r '], expected: "\t card=********0012\ncard=12345678901 card=********0013\r ", hidden: true },
    { args: ['card=１２３４５６７８９０１２ card=123456789012\u00a0extra=ok'], expected: "card=１２３４５６７８９０１２ card=123456789012 extra=ok", hidden: true },
  ],
  hints: ['Keep the delimiters when splitting so you can join the line without losing formatting.', 'Check the entire field before replacing any digits.'],
  reference: {
    javascript: `function redactPaymentLog(line) {
  return line.split(/([ \\t\\n\\r\\v\\f]+)/).map((field) => {
    if (!/^card=[0-9]{12,19}$/.test(field)) return field;
    return 'card=' + '*'.repeat(field.length - 9) + field.slice(-4);
  }).join('');
}`,
    python: `import re

def redact_payment_log(line):
    def mask(field):
        if not re.fullmatch(r"card=[0-9]{12,19}", field):
            return field
        digits = field[5:]
        return "card=" + "*" * (len(digits) - 4) + digits[-4:]
    return "".join(mask(field) for field in re.split(r"([ \\t\\n\\r\\v\\f]+)", line))`,
  },
  solutionNotes: 'Split with a capture group to retain the separators. Match the whole field, then take the final four digits from the original. This avoids partial matches inside longer IDs.',
  interviewNotes: 'Separate an expected match from a near miss. Which cases would you add before using the function on a second log format?',
};

export default item;
