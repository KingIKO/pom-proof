import type { MutationItem } from '../../types';

const implementation = `function createServer() {
  const byKey = new Map();
  let nextId = 1;
  const error = (status, code) => ({ status, body: { error: code } });
  return ({ method, path, headers, body }) => {
    if (method !== 'POST' || path !== '/orders') return error(404, 'not_found');
    const key = headers['idempotency-key'];
    if (!key || !/^[A-Za-z0-9-]+$/.test(key)) return error(400, 'invalid_key');
    const { sku, quantity } = body ?? {};
    if (typeof sku !== 'string' || !/^[A-Z]+$/.test(sku) ||
        !Number.isSafeInteger(quantity) || quantity < 1) return error(400, 'invalid_order');
    const lookup = key;
    const previous = byKey.get(lookup);
    if (previous) {
      if (previous.sku !== sku || previous.quantity !== quantity) return error(409, 'key_conflict');
      return { status: 200, body: previous };
    }
    const order = { id: nextId++, sku, quantity };
    byKey.set(lookup, order);
    return { status: 201, body: order };
  };
}`;

const item: MutationItem = {
  id: 'idempotent-orders-api',
  title: 'Test orders retried with an idempotency key',
  kind: 'mutation',
  subject: 'api',
  difficulty: 'Hard',
  topics: ['API testing', 'Idempotency', 'State transitions', 'Mutation testing'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Distinguish a replay, a conflicting retry, and a separate order.',
  prompt: 'Write request tests for order retries. To earn a full mutation score, every test must pass on the real API and each planted bug must fail at least one test.',
  contract: `
Use \`POST /orders\`. Each test starts with no stored orders. Order responses have exactly \`{ id, sku, quantity }\`. IDs start at 1 and increase by 1 for each newly created order. Errors and replays do not consume IDs.

- The \`Idempotency-Key\` header is required. The header name is case-insensitive, but the value is case-sensitive and must contain one or more ASCII letters, digits, or hyphens. Missing or invalid keys return \`400 {"error":"invalid_key"}\` before body validation.
- The body needs a string \`sku\` of one or more uppercase ASCII letters and a numeric \`quantity\` that is a positive safe integer. Ignore other fields. An invalid body returns \`400 {"error":"invalid_order"}\`.
- If the key has never created an order, store one and return \`201\` with the order.
- If the key already has an order and both fields match, return \`200\` with the original order. Never create another order on replay.
- If the same key is used with a different SKU or quantity, return \`409 {"error":"key_conflict"}\` and leave the original order untouched.
- Other routes return \`404 {"error":"not_found"}\`.
`,
  implementation,
  mutants: [
    { id: 'optional-key', label: 'An order can be created without an idempotency key.', code: implementation.replace("if (!key || !/^[A-Za-z0-9-]+$/.test(key))", "if (key !== undefined && !/^[A-Za-z0-9-]+$/.test(key))") },
    { id: 'zero-order', label: 'A zero-quantity order passes validation.', code: implementation.replace('quantity < 1', 'quantity < 0') },
    { id: 'replay-created-status', label: 'A replay returns 201 instead of 200.', code: implementation.replace('status: 200, body: previous', 'status: 201, body: previous') },
    { id: 'conflict-status', label: 'Reusing a key with different order fields returns 400 instead of 409.', code: implementation.replace("error(409, 'key_conflict')", "error(400, 'key_conflict')") },
    { id: 'unrecorded-key', label: 'The first order is not recorded under its key, so a retry creates another order.', code: implementation.replace('    byKey.set(lookup, order);\n', '') },
    { id: 'folded-key', label: 'Keys that differ only by case are treated as identical.', code: implementation.replace('const lookup = key;', 'const lookup = key.toLowerCase();') },
  ],
  starter: `test('A valid order gets an ID', async ({ request }) => {
  const order = await request.post('/orders', {
    headers: { 'Idempotency-Key': 'run-a' },
    data: { sku: 'CABLE', quantity: 2 },
  });
  expect(order.status()).toBe(201);
  expect(await order.json()).toEqual({ id: 1, sku: 'CABLE', quantity: 2 });
});

// TODO: Submit multiple requests using the same key.
// TODO: Try invalid input followed by a valid retry.`,
  referenceTests: `const order = { sku: 'CABLE', quantity: 2 };

function post(request, key, data = order) {
  const headers = key === undefined ? {} : { 'Idempotency-Key': key };
  return request.post('/orders', { headers, data });
}

test('A missing, empty, or malformed key is rejected before body validation', async ({ request }) => {
  for (const key of [undefined, '', 'run a']) {
    const result = await post(request, key);
    expect(result.status()).toBe(400);
    expect(await result.json()).toEqual({ error: 'invalid_key' });
  }
  const bothInvalid = await post(request, undefined, {});
  expect(await bothInvalid.json()).toEqual({ error: 'invalid_key' });
});

test('An invalid body does not reserve its key or consume an ID', async ({ request }) => {
  for (const data of [{ ...order, quantity: 0 }, { ...order, quantity: '2' }, { ...order, sku: 'cable' }]) {
    const result = await post(request, 'run-a', data);
    expect(result.status()).toBe(400);
    expect(await result.json()).toEqual({ error: 'invalid_order' });
  }
  const valid = await post(request, 'run-a');
  expect(valid.status()).toBe(201);
  expect(await valid.json()).toEqual({ id: 1, ...order });
});

test('Retry with the same fields returns the original ID and does not create an order', async ({ request }) => {
  const first = await post(request, 'run-a');
  expect(first.status()).toBe(201);
  const replay = await post(request, 'run-a', { quantity: 2, sku: 'CABLE', trace: 'retry' });
  expect(replay.status()).toBe(200);
  expect(await replay.json()).toEqual(await first.json());
  const next = await post(request, 'run-b');
  expect((await next.json()).id).toBe(2);
});

test('Changes to either field conflict and preserve the original order', async ({ request }) => {
  await post(request, 'run-a');
  for (const data of [{ ...order, sku: 'CASE' }, { ...order, quantity: 3 }]) {
    const result = await post(request, 'run-a', data);
    expect(result.status()).toBe(409);
    expect(await result.json()).toEqual({ error: 'key_conflict' });
  }
  const replay = await post(request, 'run-a');
  expect(replay.status()).toBe(200);
  expect(await replay.json()).toEqual({ id: 1, ...order });
});

test('Keys with different casing can create separate orders', async ({ request }) => {
  await post(request, 'RUN-A');
  const result = await post(request, 'run-a');
  expect(result.status()).toBe(201);
  expect(await result.json()).toEqual({ id: 2, ...order });
});`,
  solutionNotes: 'Use the same fixture within one test to observe state across requests. Check IDs as well as statuses so a duplicate order cannot hide behind a plausible replay response.',
  interviewNotes: 'Explain why an identical body under a different key can create a new order. How would you test a retry after the service stored an order but the original response was lost?',
};

export default item;
