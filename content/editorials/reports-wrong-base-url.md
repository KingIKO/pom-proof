---
problem: diagnosis/reports-wrong-base-url
---

## What is going on

The deploy step reports preview build `b391`. The CI test sees the demo's `Request a demo` heading and its build marker, `demo-07`. Both sites serve HTML at `/reports/revenue`. A successful response can therefore come from either site.

## The answer

1. Check the `baseURL` setting in CI.

   **Why:** Playwright uses `baseURL` to turn a relative path into a full URL. The first request points to `demo.example.test`. The test has opened the wrong deployment before any redirect or wait for the heading.

2. Make setup check the final origin and build marker against the deploy step's required preview URL and build marker.

   **Why:** If CI requires the preview URL, a missing URL stops the run before it can use local or demo settings. The origin is the URL's scheme, host, and port. The final origin can reveal a redirect, and the build marker can reveal an old build on the right host. Reporting a mismatch in setup keeps feature tests from running against the wrong build. If local runs need a default, an explicit, separate value keeps it out of CI.

3. Compare the first request, final origin, and build marker before and after correcting only `baseURL`.

   **Why:** Before the change, the first request and final origin point to the demo, and the build marker reads `demo-07`. Those destinations show the problem starts in configuration, before any redirect. The rerun must reach the preview and show `b391`. Changing only the base URL tests the suspected cause while keeping rendering and permissions the same.

## Why the tempting answer fails

The decoy names the configuration mistake and checks the first request correctly. A fixed preview address can pass today and send later jobs to an old deployment. HTTP 200 tells you only that a page responded. More time will leave the test on the demo page.

## What the interviewer listens for

Show how you would check which deployment the test opened. Do that before treating a missing heading as a feature failure.

## Sources

- [Playwright: `baseURL`](https://playwright.dev/docs/api/class-testoptions#test-options-base-url)
- [Playwright: trace viewer](https://playwright.dev/docs/trace-viewer)
