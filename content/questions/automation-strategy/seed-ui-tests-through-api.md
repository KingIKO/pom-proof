---
title: "When would you create test data through an API before opening the browser?"
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: scenario
oneLine: "I'd use an API to set up what the browser test needs. I'd do the action I'm testing the same way a customer would."
looksFor:
  - "Say what counts as setup and what behavior the test checks."
  - "Give the test unique records in a known state."
  - "Stop if setup fails and report the failure where it happened."
  - "Clean up only records the test created."
trap: "Using the setup request to do the action the test is meant to check."
followUps:
  - question: "What if the API can't create a record the test needs?"
    answer: "I'd ask the team for a supported way to create it. Until then, I'd use the real setup flow and report setup failures separately from failures in the feature."
sources:
  - label: Playwright API testing
    url: https://playwright.dev/docs/api-testing
---

I use an API, an interface code can call, to set up facts the test assumes. If I'm testing an invoice download, I can create a paid order before the browser opens. If I'm testing order placement, I'd make the purchase through the browser. Playwright's `APIRequestContext` sends setup requests without clicking through admin screens.

I'd check the setup response and save the returned order ID. If order creation fails, I'd report it before anyone looks for a missing Download button. I'd give each run its own account or records and delete only what it created. I'd also test separately how the app makes real invoices.

### Example

I'd create a fictional paid order and check that its invoice is ready. I'd open the order in the browser and download the invoice. Then I'd check that it shows the same order and amount.
