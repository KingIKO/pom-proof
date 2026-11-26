---
problem: diagnosis/reports-wrong-base-url
---

The preview job advertises build `b391`. The very first request from the test goes to `demo.example.test`, and the response still identifies `demo-07`. Playwright resolves `/reports/revenue` using the configured `baseURL`; the same path can return completely different content on another deployment.

Have the test job pass the URL and expected build marker from its deploy step. Reject a missing URL for CI preview tests rather than silently accepting a local or demo default. At setup, check the final origin and build marker. If they differ, report these values before any feature tests run. Local development can still have its own explicit default.

Hard-coding today's preview hostname can make the check pass once and quietly send later jobs to an old preview. A longer wait just gives the demo page more time to display the same content.

In an interview, distinguish the initial destination from the final one. The first request catches a bad base URL; the final origin and build marker can also catch an unexpected redirect or stale deployment. HTTP 200 only confirms a page responded.

[Playwright: `baseURL`](https://playwright.dev/docs/api/class-testoptions#test-options-base-url) · [Playwright: trace viewer](https://playwright.dev/docs/trace-viewer)
