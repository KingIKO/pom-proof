---
problem: diagnosis/invite-email-collision
---

The invite belongs to the organization and email pair. The two administrators get separate sessions, but their requests still go to `o9` with the same address. The first request creates `i92`. The second fails before the browser visits the members page because the server already has that pending invite.

Replace the literal email with one generated for each attempt. For example, use a UUID as part of the address in the test mail domain. Keep that value in the UI assertion and record the invite ID for cleanup. Delete only the record this attempt created, even if the test fails after setup succeeds.

Using only `parallelIndex` would work within one run if it were used once per worker. Both independent CI jobs can have index zero, and two tests on one worker can reuse that index. Treating 409 as success would allow a stale invitation to pass a fresh-invite check.

In an interview, show the API audit entries and repeat the overlap with only the addresses changed. Serial execution can hide the collision without proving the test is isolated.

[Playwright: parallel worker index](https://playwright.dev/docs/test-parallel#worker-index-and-parallel-index) · [Node.js: `crypto.randomUUID`](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)
