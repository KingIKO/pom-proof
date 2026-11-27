---
problem: diagnosis/reports-wrong-base-url
---

## What is going on

The deploy step advertises preview build `b391`. CI instead receives the demo's `Request a demo` heading and build marker `demo-07`. Both sites serve HTML at `/reports/revenue`, so a successful response can still come from the wrong site.

## The answer

1. Identify the CI `baseURL` as the reason the test opens another deployment.

   **Why:** Playwright resolves the relative path using `baseURL`. The initial request already points to `demo.example.test`, so the mismatch begins before any redirect or wait for the heading.

2. Require the deploy step's preview URL and expected build marker in CI. Check the final origin and build marker in setup, and report any mismatch before the feature tests run. Keep a separate explicit local default if needed.

   **Why:** A required input prevents a missing preview URL from quietly falling back to local or demo settings. The final check can also catch a redirect to another origin or a stale build served on the right host.

3. Confirm the first navigation went to the demo and the final origin and marker identify `demo-07`. Then change only `baseURL` and verify that the test reaches the preview and sees `b391`.

   **Why:** The first and final destinations distinguish bad configuration from a redirect. Correcting just the base URL tests the cause while leaving rendering and permissions unchanged.

## Why the tempting answer fails

The decoy names the configuration mistake and correctly inspects the first request. Hard-coding today's preview can pass once and send future jobs to an old deployment. HTTP 200 establishes only that a page responded, and waiting longer will not turn the demo page into the preview.

## What the interviewer listens for

Show how to prove which deployment ran the test before treating a missing heading as a feature failure.

## Sources

- [Playwright: `baseURL`](https://playwright.dev/docs/api/class-testoptions#test-options-base-url)
- [Playwright: trace viewer](https://playwright.dev/docs/trace-viewer)
