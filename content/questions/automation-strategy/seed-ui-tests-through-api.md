---
title: When would you set up a browser test through an API?
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: scenario
oneLine: Use an API for prerequisites and leave the behavior you're testing on the real customer path.
looksFor:
  - A boundary between setup and the feature under test
  - Unique records with known state
  - Setup failures that stop the test with useful evidence
  - Cleanup limited to test-owned records
trap: Using the setup endpoint to do the very action the test is supposed to verify.
followUps:
  - question: What if the API cannot create the prerequisite?
    answer: I'd discuss a supported seed path with the team. Until then I'd use the real setup flow and make a failure there distinct from a feature failure.
sources:
  - label: Playwright API testing
    url: https://playwright.dev/docs/api-testing
---

I use an API to set up facts the test assumes. For a test of downloading an invoice, it's reasonable to create a paid order before the browser opens. For a test of placing that order, I'd keep the purchase in the flow. Playwright's `APIRequestContext` can send the setup requests without clicking through admin screens.

I check the setup response and keep the returned order ID. If creation fails, I want the report to say so before anyone tries to debug a missing Download button. I'd give the run its own test account or records and clean up what it actually created. I also keep separate coverage for how the app produces real invoices.

### Example

I create a synthetic paid order and confirm that its invoice is ready. I open that order in the browser, download the invoice, and check the document names the same order and amount.
