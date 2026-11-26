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
    prompt: Why is Revenue report absent in CI?
    choices:
      - { id: route, text: The CI base URL resolves the relative path against a different deployment. }
      - { id: role, text: The preview tester lost report permissions after sign-in. }
      - { id: resize, text: Headless execution hides the report title on small viewports. }
      - { id: wait, text: Revenue report takes longer to render in CI than on a developer machine. }
  - id: fix
    type: single-choice
    prompt: Which change prevents this kind of silent misrouting?
    choices:
      - { id: url, text: Set baseURL from the required preview URL and fail setup if the final origin or build marker differs from that job's deployment. }
      - { id: timeout, text: Increase the report assertion timeout and retry on failure. }
      - { id: alternate, text: Accept the demo page title as another valid heading. }
      - { id: local, text: Copy a currently working preview hostname into the test and bypass the job configuration. }
  - id: evidence
    type: multi-select
    prompt: Which checks distinguish the wrong deployment from a slow page?
    choices:
      - { id: status, text: The HTML response is 200 in CI. }
      - { id: request-origin, text: The first navigation request goes to demo.example.test before any redirect. }
      - { id: build, text: "The final origin and build marker identify the demo, and correcting only baseURL reaches the expected preview build." }
      - { id: yellow, text: A screenshot shows the same theme color as the preview. }
reference:
  cause: route
  fix: url
  evidence: [request-origin, build]
decoy:
  cause: route
  fix: local
  evidence: [status, request-origin]
---

The report is available only on the preview deployment for this job. Both the demo and preview respond with HTML at `/reports/revenue`. A CI variable inherited from an older demo job can set `APP_BASE_URL`.

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
