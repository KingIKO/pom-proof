import type { MutationItem } from '../../types';

const implementation = `function pageWindow(total, page, size) {
  if (![total, page, size].every(Number.isInteger)) return null;
  if (total < 0 || total > 1000000 || page < 1 || page > 10000 || size < 1 || size > 100) return null;
  const start = Math.min(total, (page - 1) * size);
  const end = Math.min(total, start + size);
  return { start, end, hasNext: end < total, totalPages: Math.ceil(total / size) };
}`;

const item: MutationItem = {
  id: 'page-window',
  title: 'Test a page-to-slice helper',
  kind: 'mutation',
  subject: 'function',
  difficulty: 'Easy',
  topics: ['Boundary values', 'Pagination', 'Mutation testing'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Check how page numbers map to zero-based slice positions.',
  prompt: 'Write a test suite for the page helper. Pass on the real code and make at least one test fail on each planted bug. This gives a full mutation score.',
  contract: `
\`pageWindow(total, page, size)\` accepts integers: \`total\` from 0 to 1,000,000, one-based \`page\` from 1 to 10,000, and \`size\` from 1 to 100. Return \`null\` for an invalid input.

Return \`{ start, end, hasNext, totalPages }\` for valid input:

- Page one starts at index 0. Each later page advances by \`size\`. If the page starts at or past the end of the collection, both \`start\` and \`end\` equal \`total\`.
- \`end\` is exclusive. It is \`start + size\` or \`total\`, whichever is smaller.
- \`hasNext\` is true exactly when more items remain after this slice.
- \`totalPages\` is the number of pages needed to hold all items at this size. An empty collection takes zero pages.
`,
  implementation,
  mutants: [
    { id: 'zero-based-page', label: 'Page one starts at the second slice.', code: implementation.replace('(page - 1) * size', 'page * size') },
    { id: 'next-at-end', label: 'The last page still reports a next page.', code: implementation.replace('end < total', 'end <= total') },
    { id: 'full-page-count', label: 'A partial final page is left out of the page count.', code: implementation.replace('Math.ceil', 'Math.floor') },
    { id: 'unclamped-start', label: 'The start index for an out-of-range page can exceed the collection size.', code: implementation.replace('Math.min(total, (page - 1) * size)', '(page - 1) * size') },
    { id: 'exclusive-max-size', label: 'The maximum allowed page size of 100 is rejected.', code: implementation.replace('size > 100', 'size >= 100') },
    { id: 'unclamped-end', label: 'The exclusive end of a partial page can exceed the collection size.', code: implementation.replace('Math.min(total, start + size)', 'start + size') },
  ],
  starter: `test('Page two of fifty items starts at index ten', () => {
  expect(pageWindow(50, 2, 10)).toEqual({ start: 10, end: 20, hasNext: true, totalPages: 5 });
});

// TODO: Cover the end of a collection.
// TODO: Test the edges of the valid input ranges.`,
  referenceTests: `test('Page one starts at index zero', () => {
  expect(pageWindow(20, 1, 10)).toEqual({ start: 0, end: 10, hasNext: true, totalPages: 2 });
});

test('Exact final page has no next page', () => {
  expect(pageWindow(20, 2, 10)?.hasNext).toBe(false);
});

test('Partial last page has a clipped end and counts as a page', () => {
  expect(pageWindow(21, 3, 10)).toEqual({ start: 20, end: 21, hasNext: false, totalPages: 3 });
});

test('Past the end is an empty slice at total', () => {
  expect(pageWindow(21, 10, 10)).toEqual({ start: 21, end: 21, hasNext: false, totalPages: 3 });
  expect(pageWindow(0, 1, 10)).toEqual({ start: 0, end: 0, hasNext: false, totalPages: 0 });
});

test('Accept the maximum size and reject invalid inputs', () => {
  expect(pageWindow(200, 1, 100)?.end).toBe(100);
  expect(pageWindow(20, 1, 101)).toBeNull();
  expect(pageWindow(20, 0, 10)).toBeNull();
  expect(pageWindow(20, 1, 3.5)).toBeNull();
});`,
  solutionNotes: 'Exact multiples test the transition to no next page. Partial pages test both the clipped slice and rounded-up page count. A request far past the end distinguishes a clipped start from a raw offset.',
  interviewNotes: 'Explain the difference between the highest page number in the input contract and the last page that has data. Which assertions distinguish an empty page from an invalid page?',
};

export default item;
