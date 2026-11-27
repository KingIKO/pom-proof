---
title: A report test opens the wrong deployment
kind: diagnosis
topic: test-config
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Why doesn't the Revenue report appear in CI?
    choices:
      - { id: route, text: "CI's base URL sends the relative path to a different deployment." }
      - { id: role, text: The preview tester lost permission to see the report after signing in. }
      - { id: resize, text: Running without a visible browser hides the title on small viewports. }
      - { id: wait, text: The report takes longer to appear in CI than on a developer machine. }
  - id: fix
    type: single-choice
    prompt: Which change stops the test from opening the wrong deployment without warning?
    choices:
      - { id: url, text: "Require the preview URL for `baseURL`. If the final origin or build marker differs from the job's deployment, fail setup." }
      - { id: timeout, text: "Give the check for the report heading more time to pass. If the check fails, retry it." }
      - { id: alternate, text: Add the demo page title to the headings that the check accepts. Either heading can satisfy the check. }
      - { id: local, text: Copy a preview hostname that works today into the test. Use that value instead of reading the job configuration. }
  - id: evidence
    type: multi-select
    prompt: Which observations tell the wrong deployment apart from a slow page?
    choices:
      - { id: status, text: The request that CI makes for the page receives an HTML response with status 200. }
      - { id: request-origin, text: The first request to open the page goes to `demo.example.test` before any redirect. }
      - { id: build, text: "The final origin and build marker point to the demo. Changing only `baseURL` reaches the expected preview build." }
      - { id: yellow, text: A screenshot of the page CI opened shows the same theme color as the preview. }
reference:
  cause: route
  fix: url
  evidence: [request-origin, build]
decoy:
  cause: route
  fix: local
  evidence: [status, request-origin]
---

Only this job's preview deployment has the report. Both the demo and the preview return HTML for `/reports/revenue`. The job can get its `APP_BASE_URL` setting from an older demo job's CI variables. Playwright's `baseURL` setting supplies the base URL for relative paths. The origin is the URL's scheme, host, and port.

```ts
// playwright.config.ts
export default defineConfig({
  use: { baseURL: process.env.APP_BASE_URL ?? 'http://localhost:3000' },
});

// revenue.spec.ts
await page.goto('/reports/revenue');
await expect(page.getByRole('heading', { name: 'Revenue report' })).toBeVisible();
```

```text
deploy output   https://pr-391.preview.example.test  build b391
CI first GET   https://demo.example.test/reports/revenue
CI response    200  final host demo.example.test  build demo-07
page heading   "Request a demo"
```
