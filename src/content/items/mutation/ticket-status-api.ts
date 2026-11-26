import type { MutationItem } from '../../types';

const implementation = `function createServer() {
  const tickets = new Map([
    ['t-10', { id: 't-10', status: 'open' }],
    ['t-11', { id: 't-11', status: 'in_progress' }],
  ]);
  const states = ['open', 'in_progress', 'closed'];
  const next = { open: 'in_progress', in_progress: 'closed' };
  const notFound = { status: 404, body: { error: 'not_found' } };
  return ({ method, path, body }) => {
    const match = path.match(/^\\/tickets\\/([^/]+)$/);
    const current = match && tickets.get(match[1]);
    if (!current) return notFound;
    if (method === 'GET') return { status: 200, body: current };
    if (method !== 'PATCH') return notFound;
    const target = body?.status;
    if (!states.includes(target)) return { status: 400, body: { error: 'invalid_status' } };
    if (target === current.status) return { status: 200, body: current };
    if (next[current.status] !== target) {
      return { status: 409, body: { error: 'invalid_transition', from: current.status, to: target } };
    }
    const updated = { id: current.id, status: target };
    tickets.set(updated.id, updated);
    return { status: 200, body: updated };
  };
}`;

const item: MutationItem = {
  id: 'ticket-status-api',
  title: 'Test a ticket status workflow',
  kind: 'mutation',
  subject: 'api',
  difficulty: 'Medium',
  topics: ['API testing', 'State transitions', 'Mutation testing'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Test valid transitions, rejected jumps, and repeat requests.',
  prompt: 'Write a request suite for ticket status changes. For a full mutation score, pass every test on the real API and make each planted bug fail at least one test.',
  contract: `
Each test starts with \`t-10\` in \`open\` and \`t-11\` in \`in_progress\`. IDs are case-sensitive. Successful ticket responses have exactly \`{ id, status }\`.

- \`GET /tickets/:id\` returns \`200\` and the stored ticket.
- \`PATCH /tickets/:id\` changes the status. The body’s \`status\` must be exactly \`"open"\`, \`"in_progress"\`, or \`"closed"\`. Ignore other fields. An absent or unrecognized status returns \`400 {"error":"invalid_status"}\`.
- Allow \`open → in_progress\` and \`in_progress → closed\`. Store the new status and return \`200\` with the updated ticket. Asking for the ticket’s current status also returns \`200\` and leaves it unchanged.
- All other transitions return \`409 {"error":"invalid_transition","from":"<current status>","to":"<requested status>"}\` and leave storage untouched.
- Unsupported routes and nonexistent IDs return \`404 {"error":"not_found"}\`. Check existence before validating the body.
`,
  implementation,
  mutants: [
    { id: 'unknown-status-code', label: 'Unrecognized statuses return conflict instead of bad request.', code: implementation.replace("status: 400, body: { error: 'invalid_status' }", "status: 409, body: { error: 'invalid_status' }") },
    { id: 'no-repeat', label: 'Repeating a ticket’s current status is rejected as a conflict.', code: implementation.replace('    if (target === current.status) return { status: 200, body: current };\n', '') },
    { id: 'skip-in-progress', label: 'Open tickets can skip the in-progress stage and close directly.', code: implementation.replace('if (next[current.status] !== target)', "if (next[current.status] !== target && !(current.status === 'open' && target === 'closed'))") },
    { id: 'can-reopen', label: 'Closed tickets can be reopened.', code: implementation.replace("in_progress: 'closed' };", "in_progress: 'closed', closed: 'open' };") },
    { id: 'not-persisted', label: 'A valid transition returns the new status without saving it.', code: implementation.replace('    tickets.set(updated.id, updated);\n', '') },
    { id: 'generic-conflict-body', label: 'The conflict response omits the source and target statuses.', code: implementation.replace(", from: current.status, to: target", '') },
  ],
  starter: `test('A seeded ticket can be fetched', async ({ request }) => {
  const result = await request.get('/tickets/t-10');
  expect(result.status()).toBe(200);
  expect(await result.json()).toEqual({ id: 't-10', status: 'open' });
});

// TODO: Test allowed and forbidden transitions.
// TODO: Read the ticket again to check stored state.`,
  referenceTests: `function change(request, id, status) {
  return request.patch('/tickets/' + id, { data: { status } });
}

test('An unrecognized ticket status returns 400', async ({ request }) => {
  const result = await change(request, 't-10', 'CLOSED');
  expect(result.status()).toBe(400);
  expect(await result.json()).toEqual({ error: 'invalid_status' });
});

test('A request for the existing status succeeds unchanged', async ({ request }) => {
  const result = await change(request, 't-10', 'open');
  expect(result.status()).toBe(200);
  expect(await result.json()).toEqual({ id: 't-10', status: 'open' });
});

test('An open ticket cannot skip to closed', async ({ request }) => {
  const result = await change(request, 't-10', 'closed');
  expect(result.status()).toBe(409);
  expect(await result.json()).toEqual({ error: 'invalid_transition', from: 'open', to: 'closed' });
  const read = await request.get('/tickets/t-10');
  expect(await read.json()).toEqual({ id: 't-10', status: 'open' });
});

test('Both steps persist and a closed ticket cannot reopen', async ({ request }) => {
  const moving = await change(request, 't-10', 'in_progress');
  expect(moving.status()).toBe(200);
  expect(await moving.json()).toEqual({ id: 't-10', status: 'in_progress' });
  const active = await request.get('/tickets/t-10');
  expect(await active.json()).toEqual({ id: 't-10', status: 'in_progress' });
  const closed = await change(request, 't-10', 'closed');
  expect(closed.status()).toBe(200);
  const reopen = await change(request, 't-10', 'open');
  expect(reopen.status()).toBe(409);
  expect(await reopen.json()).toEqual({ error: 'invalid_transition', from: 'closed', to: 'open' });
  const done = await request.get('/tickets/t-10');
  expect(await done.json()).toEqual({ id: 't-10', status: 'closed' });
});

test('A valid status for an unknown ID returns 404', async ({ request }) => {
  const result = await change(request, 't-99', 'in_progress');
  expect(result.status()).toBe(404);
  expect(await result.json()).toEqual({ error: 'not_found' });
});`,
  solutionNotes: 'Start with a state diagram and test forbidden edges as well as allowed ones. Check state after a rejected transition, since a refusal must leave the record unchanged.',
  interviewNotes: 'Explain why an unknown status and a forbidden transition are different errors. How would you test two clients trying to change the same ticket concurrently?',
};

export default item;
