---
title: How do you use a Playwright trace to diagnose a CI failure?
topic: playwright
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: Find the first wrong step and compare its action log, page snapshot, and network evidence.
looksFor:
  - A distinction between the root failure and the last timeout
  - An action log and snapshot used together
  - Network evidence tied to the user flow
  - A retention policy that captures useful attempts safely
trap: Looking only at the last screenshot and guessing the timeout was too short.
followUps:
  - question: What if the trace only shows a passing retry?
    answer: I'd adjust trace retention to capture a failed initial run and keep its result alongside the retry.
sources:
  - label: Playwright Trace Viewer
    url: https://playwright.dev/docs/trace-viewer
  - label: Playwright trace configuration
    url: https://playwright.dev/docs/trace-viewer-intro
  - label: Playwright trace retention options
    url: https://playwright.dev/docs/api/class-testoptions#test-options-trace
examples:
  - title: Retain the failed export attempt
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test.use({ trace: 'retain-on-failure' });

          test('offers the generated export for download', async ({ page }) => {
            await page.goto('http://localhost:3000/reports/sample');
            await page.getByRole('button', { name: 'Generate' }).click();
            await expect(page.getByRole('link', { name: 'Download report' })).toBeVisible();
          });
---

I open the trace at the failing step and read backward to the first unexpected state. The action log tells me what Playwright was trying to do. The DOM snapshot shows which page it was operating on, and the network view can tell me whether a dependency responded as expected. These clues together beat guessing from the last line of the stack.

I'd check which attempt produced the trace. Recording only the first retry can leave me looking at a pass, so if I need first-failure evidence I'd choose a policy that retains failed attempts. I use test data and keep the trace accessible only to people who need it.

### Example

If Download never appeared, I'd inspect the preceding Generate click and its network response. A failed export call gives me a better lead than the missing button in the final snapshot.

The local report fixture should produce a download link after generation. A failed attempt keeps a trace. I can open its `trace.zip` with `npx playwright show-trace` and inspect what happened between the click and assertion.
