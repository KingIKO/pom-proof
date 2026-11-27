---
title: Two jobs invite the same email address
kind: diagnosis
topic: test-data
difficulty: medium
minutes: 6
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Why doesn't a separate browser context prevent the 409 response?
    choices:
      - { id: cookies, text: The two browser contexts share the same cookies as they set up their tests. }
      - { id: cleanup, text: The cleanup step deletes an invite before the test gets a chance to open it. }
      - { id: permission, text: The second admin temporarily loses the permission to invite new users. }
      - { id: duplicate, text: "Both jobs request the same invite, which must be unique per address and organization." }
  - id: fix
    type: single-choice
    prompt: Which change still tests a fresh invitation?
    choices:
      - { id: fresh, text: "Create a unique email per attempt, check that address and remove only its invite." }
      - { id: worker-index, text: "Add only Playwright's `parallelIndex` value to the end of the fixed email address." }
      - { id: retry, text: Repeat the setup step with the same email until the POST request succeeds. }
      - { id: allow, text: "Treat a 409 response as success, and read the existing invite instead." }
  - id: evidence
    type: multi-select
    prompt: Which checks would connect the duplicate response to the test data?
    choices:
      - { id: reason, text: The audit log ties the rejected email and organization to the pending invite from the other job. }
      - { id: role, text: Both admin tokens include the permission to invite users. }
      - { id: overlap, text: "When only the generated addresses differ, the jobs still overlap and both create invites." }
      - { id: parallel, text: A repeat run passes when only one CI job is running. }
reference:
  cause: duplicate
  fix: fresh
  evidence: [reason, overlap]
decoy:
  cause: duplicate
  fix: worker-index
  evidence: [reason, parallel]
---

A fixture is a ready-made helper that Playwright passes to each test. An invite test creates its data through Playwright's `request` fixture, which sends API calls without the browser. Then the test checks that the pending invite appears on the members page. Each CI job uses a different admin account but the same test organization. Each organization allows only one pending invite per email address.

A worker is a process that runs tests. Playwright's `parallelIndex` value numbers the workers inside one job. Both jobs use one worker, so both report `parallelIndex=0`. A browser context is an isolated browser session with its own cookies. Status 409 means the server rejected a request that conflicts with existing data.

```ts
const email = 'new.member@example.test';
const created = await request.post('/api/orgs/o9/invites', { data: { email } });
expect(created.status()).toBe(201);
await page.goto('/settings/members');
await expect(page.getByRole('row', { name: `${email} Pending` })).toBeVisible();
```

```text
job 184   admin a31  org o9  new.member@example.test  201  invite i92
job 185   admin a87  org o9  new.member@example.test  409  PENDING_INVITE_EXISTS
job 185   expected 201, got 409 before page navigation
```
