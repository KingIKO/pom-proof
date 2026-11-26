import type { TestDesignItem } from '../../types';

const accepted = 'Accept';
const rejected = 'Reject';
const result = (ok: boolean) => ok ? accepted : rejected;
const integerWithin = (age: unknown, min: number, max: number) =>
  typeof age === 'number' && Number.isInteger(age) && age >= min && age <= max;

const item: TestDesignItem = {
  id: 'age-boundaries',
  title: 'Test the age limits',
  kind: 'testdesign',
  difficulty: 'Easy',
  technique: 'Boundary value analysis',
  topics: ['Boundary value analysis', 'Input validation'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Design rows that distinguish correct age validation from five common mistakes.',
  prompt: 'An enrollment form accepts integer ages from **18 through 65**, inclusive. It rejects anything else, including a blank age or a decimal. Add inputs and predict whether the validator should accept or reject each one. Cover each limit and its neighbors, plus non-integer input.',
  fields: [{ name: 'age', label: 'Age', type: 'number' }],
  outcomes: [accepted, rejected],
  oracle: ({ age }) => result(integerWithin(age, 18, 65)),
  partitions: [
    { id: 'lower-out', label: 'One below the lower limit', kind: 'boundary', matches: ({ age }) => age === 17 },
    { id: 'lower', label: 'Lower limit', kind: 'boundary', matches: ({ age }) => age === 18 },
    { id: 'lower-in', label: 'One above the lower limit', kind: 'boundary', matches: ({ age }) => age === 19 },
    { id: 'upper-in', label: 'One below the upper limit', kind: 'boundary', matches: ({ age }) => age === 64 },
    { id: 'upper', label: 'Upper limit', kind: 'boundary', matches: ({ age }) => age === 65 },
    { id: 'upper-out', label: 'One above the upper limit', kind: 'boundary', matches: ({ age }) => age === 66 },
    { id: 'fraction', label: 'Decimal inside the range', kind: 'invalid', matches: ({ age }) => typeof age === 'number' && age > 18 && age < 65 && !Number.isInteger(age) },
  ],
  mutants: [
    { id: 'lower-exclusive', label: 'Rejects age 18', fn: ({ age }) => result(integerWithin(age, 19, 65)) },
    { id: 'lower-loose', label: 'Accepts age 17', fn: ({ age }) => result(integerWithin(age, 17, 65)) },
    { id: 'upper-exclusive', label: 'Rejects age 65', fn: ({ age }) => result(integerWithin(age, 18, 64)) },
    { id: 'upper-loose', label: 'Accepts age 66', fn: ({ age }) => result(integerWithin(age, 18, 66)) },
    { id: 'decimal', label: 'Accepts decimals inside the range', fn: ({ age }) => result(typeof age === 'number' && age >= 18 && age <= 65) },
  ],
  hints: ['Write down the first and last accepted integers before choosing any rows.', 'Use a decimal that satisfies both bounds, so the whole-number rule decides the outcome.'],
  solutionNotes: 'Reject 17, accept 18 and 19, accept 64 and 65, reject 66. Reject 35.5 to isolate the integer check. A blank is another useful rejection test, although it is not needed for these five bugs.',
  interviewNotes: 'State why acceptance at each exact limit and rejection just outside are separate observations. If the interviewer asks about non-numeric strings, clarify whether the test targets the browser control, the API, or both.',
  sources: [
    { label: 'ISTQB CTFL v4.0.1, section 4.2.2: Boundary value analysis', url: 'https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf' },
    { label: 'MDN: Number.isInteger()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger' },
  ],
};

export default item;
