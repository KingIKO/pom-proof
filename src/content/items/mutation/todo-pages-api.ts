import type { MutationItem } from '../../types';

const implementation = `function createServer() {
  const titles = ['Pack adapter', 'Print badge', 'Charge tablet', 'Book shuttle', 'Send agenda', 'Check access'];
  const todos = titles.map((title, i) => ({ id: i + 1, title }));
  function decimal(value, fallback) {
    if (value === undefined) return fallback;
    return /^(0|[1-9][0-9]*)$/.test(value) ? Number(value) : NaN;
  }
  return ({ method, path, query }) => {
    if (method !== 'GET' || path !== '/todos') return { status: 404, body: { error: 'not_found' } };
    const limit = decimal(query.limit, 2);
    const offset = decimal(query.offset, 0);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 4 || !Number.isSafeInteger(offset) || offset < 0) {
      return { status: 400, body: { error: 'invalid_page' } };
    }
    const end = offset + limit;
    const items = todos.slice(offset, end);
    return { status: 200, body: { items, total: todos.length, nextOffset: end < todos.length ? end : null } };
  };
}`;

const item: MutationItem = {
  id: 'todo-pages-api',
  title: 'Test a paginated todo endpoint',
  kind: 'mutation',
  subject: 'api',
  difficulty: 'Medium',
  topics: ['API testing', 'Pagination', 'Mutation testing'],
  roles: ['automation', 'sdet'],
  summary: 'Check limits, invalid query values, and the end of a collection.',
  prompt: 'Test pagination with request calls. For a full mutation score, all tests must pass on the real API, and each planted bug must fail at least one test.',
  contract: `
\`GET /todos\` lists six records in ascending integer ID order. Each record contains exactly \`{ id, title }\`. IDs and titles in order from 1 through 6 are Pack adapter, Print badge, Charge tablet, Book shuttle, Send agenda, and Check access.

- Optional \`offset\` is zero-based, nonnegative, and defaults to 0. Optional \`limit\` is from 1 through 4 and defaults to 2. When supplied, either value must be a base-10 safe integer written as ASCII digits with no leading zero, except for the value \`0\`. Invalid input returns \`400 {"error":"invalid_page"}\`. Other query fields are ignored.
- Return \`200\` with \`{ items, total, nextOffset }\`. Take up to \`limit\` records starting at \`offset\`. The total is the full collection size, even for an empty page.
- If more records remain, \`nextOffset\` equals \`offset + limit\`. Otherwise it is \`null\`, including when the requested offset is at or beyond the end.
- Other routes return \`404 {"error":"not_found"}\`.
`,
  implementation,
  mutants: [
    { id: 'default-limit', label: 'Requests without a limit get three records instead of two.', code: implementation.replace('decimal(query.limit, 2)', 'decimal(query.limit, 3)') },
    { id: 'zero-based-offset', label: 'The offset skips one extra record.', code: implementation.replace('todos.slice(offset, end)', 'todos.slice(offset + 1, end + 1)') },
    { id: 'exclusive-max', label: 'The endpoint rejects the maximum limit of four.', code: implementation.replace('limit > 4', 'limit >= 4') },
    { id: 'loose-decimal', label: 'Decimal parsing accepts values with a valid integer prefix and trailing junk.', code: implementation.replace('/^(0|[1-9][0-9]*)$/.test(value) ? Number(value) : NaN', 'parseInt(value, 10)') },
    { id: 'page-total', label: 'The total reports the length of this page instead of the full collection.', code: implementation.replace('total: todos.length', 'total: items.length') },
    { id: 'end-cursor', label: 'A page ending exactly at the collection boundary advertises another page.', code: implementation.replace('end < todos.length', 'end <= todos.length') },
  ],
  starter: `test('A request for one record returns a one-item page', async ({ request }) => {
  const response = await request.get('/todos?limit=1');
  expect(response.status()).toBe(200);
  expect((await response.json()).items).toHaveLength(1);
});

// TODO: Check an omitted limit and pages near the end.
// TODO: Try malformed and out-of-range query values.`,
  referenceTests: `test('Default page starts at one, contains two records, and reports the collection size', async ({ request }) => {
  const result = await request.get('/todos');
  expect(result.status()).toBe(200);
  expect(await result.json()).toEqual({
    items: [{ id: 1, title: 'Pack adapter' }, { id: 2, title: 'Print badge' }],
    total: 6,
    nextOffset: 2,
  });
});

test('The maximum limit is allowed and offset counts from zero', async ({ request }) => {
  const result = await request.get('/todos', { params: { limit: 4, offset: 1 } });
  expect(result.status()).toBe(200);
  const page = await result.json();
  expect(page.items.map((item) => item.id)).toEqual([2, 3, 4, 5]);
  expect(page.nextOffset).toBe(5);
});

test('Bad query numbers return 400 and the exact error body', async ({ request }) => {
  const queries = ['limit=2x', 'limit=05', 'limit=5', 'limit=', 'offset=-1', 'offset=9007199254740992'];
  for (const query of queries) {
    const result = await request.get('/todos?' + query);
    expect(result.status()).toBe(400);
    expect(await result.json()).toEqual({ error: 'invalid_page' });
  }
});

test('Exact last page, partial last page, and past-end page have no next offset', async ({ request }) => {
  const exact = await request.get('/todos?offset=4&limit=2');
  expect(exact.status()).toBe(200);
  expect(await exact.json()).toEqual({
    items: [{ id: 5, title: 'Send agenda' }, { id: 6, title: 'Check access' }],
    total: 6, nextOffset: null,
  });
  const partial = await request.get('/todos?offset=5&limit=2');
  expect(await partial.json()).toEqual({ items: [{ id: 6, title: 'Check access' }], total: 6, nextOffset: null });
  const empty = await request.get('/todos?offset=9');
  expect(empty.status()).toBe(200);
  expect(await empty.json()).toEqual({ items: [], total: 6, nextOffset: null });
});`,
  solutionNotes: 'Use an exact-end request to catch a cursor off by one. Assert the complete default page and exercise raw query strings to catch permissive number parsing.',
  interviewNotes: 'Explain the difference between a valid empty page and an invalid query. What might shift between requests if the todo collection changes during pagination?',
};

export default item;
