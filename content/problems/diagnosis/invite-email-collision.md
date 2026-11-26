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
    prompt: Why does a different browser context fail to prevent the 409?
    choices:
      - { id: cookies, text: Both browser contexts reuse the same cookies during setup. }
      - { id: cleanup, text: An invite is deleted by cleanup before the test can open it. }
      - { id: permission, text: The second admin temporarily loses permission to invite users. }
      - { id: duplicate, text: "Independent jobs send the same address to the same organization, where a pending invite must be unique." }
  - id: fix
    type: single-choice
    prompt: Which change still tests a fresh invitation?
    choices:
      - { id: fresh, text: "Generate a unique email for each test attempt, use it in the assertions, and clean up only that invite." }
      - { id: worker-index, text: Append only the Playwright parallelIndex to the literal email. }
      - { id: retry, text: Retry setup with the same email until the POST succeeds. }
      - { id: allow, text: Treat 409 as success and read the existing invite instead. }
  - id: evidence
    type: multi-select
    prompt: Which checks would connect the duplicate response to test data?
    choices:
      - { id: reason, text: The audit log ties the rejected email and organization to the pending invite from the other job. }
      - { id: role, text: Both admin tokens carry the invite permission. }
      - { id: overlap, text: The jobs still overlap and both create invites when only the generated addresses differ. }
      - { id: parallel, text: A repeat run passes with just one CI job active. }
reference:
  cause: duplicate
  fix: fresh
  evidence: [reason, overlap]
decoy:
  cause: duplicate
  fix: worker-index
  evidence: [reason, parallel]
---

An invite test seeds through Playwright's `request` fixture, then checks that the pending invite appears on the members page. Each CI job uses a different admin account but the same test organization. Only one pending invite is allowed per organization and email. Both jobs use one worker, so both report `parallelIndex=0`.

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
