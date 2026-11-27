---
problem: diagnosis/invite-email-collision
---

## What is going on

Both CI jobs seed an invite before checking the members page. Different administrators send the same address to organization `o9`. Job 184 creates invite `i92`; job 185 gets `PENDING_INVITE_EXISTS` before the browser visits the page.

## The answer

1. Identify the collision on the organization and email pair as the cause of the 409.

   **Why:** The server allows only one pending invite for that pair. An isolated browser session leaves the server's existing invite untouched, and a different administrator does not change the pair used to check for duplicates.

2. Generate a fresh address for every test attempt, for example with `crypto.randomUUID()` in the test mail domain. Use that exact address in the UI assertion and clean up only the invite ID this attempt created, even if the test fails after setup.

   **Why:** An attempt can prove it created and displayed its own record only if another job cannot claim the same address. Cleanup by ID avoids deleting an invite owned by another run.

3. Use the audit log to tie the rejected email and organization to the pending invite from the other job. Then overlap the jobs again with only the generated addresses changed and confirm both create invites.

   **Why:** The audit links the failure to a specific record. Keeping the overlap holds the original contention in place while testing the data change.

## Why the tempting answer fails

The decoy gets the cause and audit evidence right. `parallelIndex` distinguishes concurrent workers within a run if used once per worker, but both jobs here report zero, and multiple attempts can reuse a worker's index. A serial pass removes the overlap without proving isolation. Accepting 409 as success can pass with a stale invite.

## What the interviewer listens for

Name the server's uniqueness rule and show how the test owns its input and cleanup across workers, jobs and retries.

## Sources

- [Playwright: parallel worker index](https://playwright.dev/docs/test-parallel#worker-index-and-parallel-index)
- [Node.js: `crypto.randomUUID`](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)
