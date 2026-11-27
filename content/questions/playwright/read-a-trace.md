---
title: How would you use a Playwright trace to find why an automated run failed?
topic: playwright
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: I'd find the first step where the test went wrong. I'd compare what Playwright did, what the page showed, and which requests succeeded.
looksFor:
  - Tell the first failure apart from the step that eventually timed out.
  - Use the list of actions and the saved page state together.
  - Match request and reply details to the step the user was trying to complete.
  - Save traces from the attempts you need and limit who can see them.
trap: Seeing only the last screenshot and assuming Playwright needed more time.
followUps:
  - question: What would you change if you can only see the successful retry?
    answer: I'd change the trace settings to keep the failed first attempt. I'd save that result alongside the retry.
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

I'd open the trace, Playwright's recording of the run, at the failed step. I'd work backward to the first unexpected state. The action log tells me what Playwright tried to do. The DOM snapshot, a saved copy of the page's structure, shows which page it used. The network view shows requests and helps me see whether each service sent the expected reply.

I'd use that evidence before drawing a conclusion from the last line of the error.

I'd check which attempt produced the trace. If I only record the first retry, I may get a trace of a passing run. If I need to see the first failure, I'd choose settings that keep failed attempts. I'd use test data and give access only to people who need the trace.

### Example

If Download never appears, I'd inspect the earlier Generate click and the reply to the export request. A failed export request gives me a better lead than a missing button in the final snapshot.

I'd expect the local report test app to show a download link after it generates the report. The test saves a trace if the attempt fails. I'd open the `trace.zip` file with the `npx playwright show-trace` command. I'd inspect what happened between the click and the check for the link.
