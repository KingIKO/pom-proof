import type { MutationItem } from '../../types';

const implementation = `function createServer() {
  const users = new Map();
  let nextId = 1;
  const error = (status, code) => ({ status, body: { error: code } });
  const hasName = (value) => typeof value === 'string' && value.trim().length > 0;
  const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ({ method, path, body }) => {
    if (method === 'POST' && path === '/users') {
      const email = normalizeEmail(body?.email);
      if (!hasName(body?.name) || !/^[a-z0-9_.+-]+@[a-z0-9-]+(\\.[a-z0-9-]+)+$/.test(email)) {
        return error(400, 'invalid_user');
      }
      if ([...users.values()].some((user) => user.email === email)) return error(409, 'duplicate_email');
      const user = { id: nextId++, email, name: body.name.trim() };
      users.set(user.id, user);
      return { status: 201, body: user };
    }
    const match = path.match(/^\\/users\\/([1-9][0-9]*)$/);
    if (!match) return error(404, 'not_found');
    const id = Number(match[1]);
    const user = users.get(id);
    if (!user) return error(404, 'not_found');
    if (method === 'GET') return { status: 200, body: user };
    if (method === 'PATCH') {
      if (!hasName(body?.name)) return error(400, 'invalid_user');
      const updated = { ...user, name: body.name.trim() };
      users.set(id, updated);
      return { status: 200, body: updated };
    }
    if (method === 'DELETE') {
      users.delete(id);
      return { status: 204 };
    }
    return error(404, 'not_found');
  };
}`;

const item: MutationItem = {
  id: 'user-directory-api',
  title: 'Test user creation and updates',
  kind: 'mutation',
  subject: 'api',
  difficulty: 'Medium',
  topics: ['API testing', 'CRUD', 'Validation', 'Mutation testing'],
  roles: ['automation', 'sdet'],
  summary: 'Test a directory’s validation, duplicate handling, and stored changes.',
  prompt: 'Write request tests for the user directory. Every test must pass on the real API. For a full mutation score, at least one test must fail on each planted bug.',
  contract: `
Each test starts with an empty directory. User responses have exactly \`{ id, email, name }\`. IDs are integers assigned in order starting at 1, consumed only on successful creation, and never reused within a test.

- \`POST /users\` creates a user from string fields \`name\` and \`email\`. Trim both with JavaScript’s \`trim()\` and lowercase the email. A name cannot be empty after trimming. The normalized email must match \`^[a-z0-9_.+-]+@[a-z0-9-]+(\\.[a-z0-9-]+)+$\`. Invalid input returns \`400 {"error":"invalid_user"}\`.
- If a normalized email is already in the directory, return \`409 {"error":"duplicate_email"}\`. Otherwise return \`201\` with the stored user.
- \`GET /users/:id\` returns \`200\` and the stored user. An ID in the path uses decimal digits with no leading zero.
- \`PATCH /users/:id\` validates and replaces only the name, using the same trimming and validation as create. Return \`200\` and the stored update, or \`400 {"error":"invalid_user"}\` for an invalid name. Ignore other input fields on create and patch.
- \`DELETE /users/:id\` removes the user, freeing its email for reuse, and returns \`204\` with an empty body.
- Unsupported routes and requests for missing users return \`404 {"error":"not_found"}\`. Patch checks existence before checking the name.
`,
  implementation,
  mutants: [
    { id: 'blank-name', label: 'Names containing only whitespace pass validation.', code: implementation.replace("typeof value === 'string' && value.trim().length > 0", "typeof value === 'string'") },
    { id: 'keeps-email-case', label: 'An otherwise valid email with uppercase letters is rejected instead of normalized.', code: implementation.replace('value.trim().toLowerCase()', 'value.trim()') },
    { id: 'duplicate-status', label: 'Attempting to add a duplicate email returns 400 instead of 409.', code: implementation.replace("error(409, 'duplicate_email')", "error(400, 'duplicate_email')") },
    { id: 'missing-status', label: 'A missing user returns a bad request instead of not found.', code: implementation.replace("if (!user) return error(404, 'not_found');", "if (!user) return error(400, 'not_found');") },
    { id: 'patch-not-stored', label: 'A name update appears in the response but is never saved.', code: implementation.replace('      users.set(id, updated);\n', '') },
    { id: 'delete-not-stored', label: 'Deleting a user returns success but leaves the user in the directory.', code: implementation.replace('      users.delete(id);\n', '') },
  ],
  starter: `test('Creates a user with valid fields', async ({ request }) => {
  const result = await request.post('/users', { data: { name: 'Ari', email: 'ari@qa.test' } });
  expect(result.status()).toBe(201);
  expect(await result.json()).toEqual({ id: 1, name: 'Ari', email: 'ari@qa.test' });
});

// TODO: Exercise invalid and duplicate inputs.
// TODO: Read a user after each kind of change.`,
  referenceTests: `async function createUser(request) {
  const result = await request.post('/users', { data: { name: 'Ari', email: 'ari@qa.test' } });
  expect(result.status()).toBe(201);
  return result.json();
}

test('Reject whitespace-only names and malformed email', async ({ request }) => {
  for (const data of [{ name: '  ', email: 'ari@qa.test' }, { name: 'Ari', email: 'not-an-email' }]) {
    const result = await request.post('/users', { data });
    expect(result.status()).toBe(400);
    expect(await result.json()).toEqual({ error: 'invalid_user' });
  }
  expect((await createUser(request)).id).toBe(1);
});

test('Trim both fields and lowercase the email', async ({ request }) => {
  const result = await request.post('/users', { data: { name: ' Ari  ', email: ' ARI@Qa.TEST ' } });
  expect(result.status()).toBe(201);
  expect(await result.json()).toEqual({ id: 1, name: 'Ari', email: 'ari@qa.test' });
});

test('A canonical duplicate returns conflict', async ({ request }) => {
  await createUser(request);
  const result = await request.post('/users', { data: { name: 'Bex', email: ' ari@qa.test ' } });
  expect(result.status()).toBe(409);
  expect(await result.json()).toEqual({ error: 'duplicate_email' });
});

test('An unknown ID is not found', async ({ request }) => {
  const result = await request.get('/users/1');
  expect(result.status()).toBe(404);
  expect(await result.json()).toEqual({ error: 'not_found' });
});

test('Reading after patch returns the stored name and original email', async ({ request }) => {
  const user = await createUser(request);
  const patch = await request.patch('/users/' + user.id, { data: { name: ' Ari Lee ', email: 'ignored@qa.test' } });
  expect(patch.status()).toBe(200);
  const expected = { ...user, name: 'Ari Lee' };
  expect(await patch.json()).toEqual(expected);
  const read = await request.get('/users/' + user.id);
  expect(read.status()).toBe(200);
  expect(await read.json()).toEqual(expected);
});

test('An invalid patch keeps the original name', async ({ request }) => {
  const user = await createUser(request);
  const result = await request.patch('/users/' + user.id, { data: { name: ' ' } });
  expect(result.status()).toBe(400);
  expect(await result.json()).toEqual({ error: 'invalid_user' });
  const read = await request.get('/users/' + user.id);
  expect(await read.json()).toEqual(user);
});

test('Deletion empties the response and frees the email but not the ID', async ({ request }) => {
  await createUser(request);
  const deleted = await request.delete('/users/1');
  expect(deleted.status()).toBe(204);
  expect(await deleted.text()).toBe('');
  const read = await request.get('/users/1');
  expect(read.status()).toBe(404);
  expect(await read.json()).toEqual({ error: 'not_found' });
  expect((await createUser(request)).id).toBe(2);
});`,
  solutionNotes: 'Check status and body separately. For a write, read from an independent request to catch responses that look right without changing stored state.',
  interviewNotes: 'Explain why a conflict is distinct from invalid input. What setup would you use to check two concurrent requests with the same normalized email?',
};

export default item;
