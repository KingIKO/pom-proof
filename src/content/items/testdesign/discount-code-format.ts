import type { DesignRow, TestDesignItem } from '../../types';

const accepted = 'Valid format';
const rejected = 'Invalid format';
const result = (ok: boolean) => ok ? accepted : rejected;
const codeOf = (row: DesignRow) => String(row.code ?? '');
const valid = (code: string) => code.length === 6 && /^[A-Z]{2}[0-9]{4}$/.test(code);
const prefixOk = (code: string) => /^[A-Z]{2}$/.test(code.slice(0, 2));
const suffixOk = (code: string) => /^[0-9]{4}$/.test(code.slice(2));

const item: TestDesignItem = {
  id: 'discount-code-format',
  title: 'Sort discount code formats',
  kind: 'testdesign',
  difficulty: 'Easy',
  technique: 'Equivalence partitioning',
  topics: ['Equivalence partitioning', 'Input validation'],
  roles: ['manual', 'automation'],
  summary: 'Choose one representative for each reason a discount code can pass or fail format validation.',
  prompt: 'A discount code has exactly two uppercase ASCII letters followed by four ASCII digits, such as `HT3052`. Case and spaces are preserved. Leading zeroes in the digits are allowed. This check validates the format only; it never looks up the code. Build a compact set of rows that covers a valid format and distinct ways to break the rule.',
  fields: [{ name: 'code', label: 'Discount code', type: 'text' }],
  outcomes: [accepted, rejected],
  oracle: (row) => result(valid(codeOf(row))),
  partitions: [
    { id: 'valid', label: 'Valid code', kind: 'valid', matches: (row) => valid(codeOf(row)) },
    { id: 'blank', label: 'Empty code', kind: 'invalid', matches: (row) => codeOf(row) === '' },
    { id: 'short', label: 'Letters followed by too few digits', kind: 'invalid', matches: (row) => /^[A-Z]{2}[0-9]{1,3}$/.test(codeOf(row)) },
    { id: 'long', label: 'Letters followed by too many digits', kind: 'invalid', matches: (row) => /^[A-Z]{2}[0-9]{5,}$/.test(codeOf(row)) },
    { id: 'prefix', label: 'Wrong letter prefix with a valid suffix', kind: 'invalid', matches: (row) => codeOf(row).length === 6 && !prefixOk(codeOf(row)) && suffixOk(codeOf(row)) },
    { id: 'suffix', label: 'Wrong digit suffix with a valid prefix', kind: 'invalid', matches: (row) => codeOf(row).length === 6 && prefixOk(codeOf(row)) && !suffixOk(codeOf(row)) },
    { id: 'space', label: 'Otherwise valid code with outer spaces', kind: 'invalid', matches: (row) => codeOf(row) !== codeOf(row).trim() && valid(codeOf(row).trim()) },
  ],
  mutants: [
    { id: 'short', label: 'Accepts three digits', fn: (row) => result(valid(codeOf(row)) || /^[A-Z]{2}[0-9]{3}$/.test(codeOf(row))) },
    { id: 'long', label: 'Accepts five digits', fn: (row) => result(valid(codeOf(row)) || /^[A-Z]{2}[0-9]{5}$/.test(codeOf(row))) },
    { id: 'case', label: 'Accepts lowercase letters in the prefix', fn: (row) => result(valid(codeOf(row).toUpperCase())) },
    { id: 'suffix', label: 'Accepts letters in the numeric suffix', fn: (row) => result(/^[A-Z]{2}[A-Z0-9]{4}$/.test(codeOf(row))) },
    { id: 'trim', label: 'Trims outer spaces before validation', fn: (row) => result(valid(codeOf(row).trim())) },
  ],
  hints: ['Keep the digit suffix valid while testing the prefix. Then reverse that setup.', 'Check shorter and longer codes separately; a length bug can affect just one direction.'],
  solutionNotes: 'Accept `HT0052`. Reject blank, `HT305`, `HT30521`, `hT3052`, `HT30A2`, and ` HT3052` (one leading space). Each rejected row targets a distinct format error.',
  interviewNotes: 'Explain what makes each sample representative of its class. Mention code existence and expiry as separate business rules with their own test inputs.',
  sources: [
    { label: 'ISTQB CTFL v4.0.1, section 4.2.1: Equivalence partitioning', url: 'https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf' },
    { label: 'MDN: Regular expression character classes', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes' },
  ],
};

export default item;
