---
problem: diagnosis/invite-email-collision
---

## What is going on

Both automated test jobs in CI create an invite before checking the members page. Different administrators send an invite to the same address in organization `o9`. Job 184 creates invite `i92`. Job 185 gets the error code `PENDING_INVITE_EXISTS` before the browser visits the page.

## The answer

1. Both jobs invite the same email address to the same organization, so the second gets a 409.

   **Why:** The server allows only one pending invite per organization and email address. The 409 response means the new request conflicts with the pending invite. A separate browser session does not change what's on the server. Switching administrators keeps the same organization and address, so the server still sees a duplicate.

2. Generate a fresh email address for every test attempt and check for that exact address on the members page.

   For example, use the `crypto.randomUUID()` function to make a unique address in the test mail domain. Even if the test fails after setup, remove only the invite with the ID this attempt created.

   **Why:** An attempt can prove it created and displayed its own invite only if another job cannot claim that address. Cleanup by ID avoids deleting another run's invite.

3. Use the audit log to link the rejected email and organization to the other job's pending invite.

   Repeat the overlap with only the generated addresses changed. Check that both jobs create invites.

   **Why:** The audit log records server actions, so it ties the rejection to a specific invite. Keeping the overlap preserves the original timing, so the data change explains the result.

## Why the tempting answer fails

The decoy correctly names the cause and uses the audit log. Playwright's `parallelIndex` identifies each worker, a process that runs tests, within one run. It can separate addresses if each worker uses it only once. Both jobs here report zero. A worker's index can also repeat across attempts.

If the jobs pass one at a time, the result only tells you what happens without overlap. If the test treats a 409 as success, it can pass with an old pending invite.

## What the interviewer listens for

Name the server rule that prevents duplicate invites. Show how each attempt keeps its address and cleanup separate across workers, jobs and retries.

## Sources

- [Playwright: parallel worker index](https://playwright.dev/docs/test-parallel#worker-index-and-parallel-index)
- [Node.js: `crypto.randomUUID`](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)
