---
title: "What should a fixture do, and what should a page object do?"
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd use fixtures to set up tests and clean up afterward. I'd use page objects to name screen actions clearly."
looksFor:
  - "Give setup and screen actions separate owners."
  - "Give each test its own records if the test changes them."
  - "Say which code cleans up the test data."
  - "Keep the behavior you're checking visible in the test file."
trap: "Creating database records just by making a page object."
followUps:
  - question: "What could tests share across workers that run them in parallel?"
    answer: "I'd consider sharing data that tests can only read. If tests edit accounts or orders, I'd give each test its own records."
sources:
  - label: Playwright fixtures
    url: https://playwright.dev/docs/test-fixtures
  - label: Playwright page object models
    url: https://playwright.dev/docs/pom
---

I use a fixture to provide what a test needs before it starts and to handle cleanup. A page object groups named actions I can take on a screen. A fixture can give the test a page object. I keep record creation out of the constructor, the code that creates the object. That way, opening the settings page doesn't silently change anyone's settings.

Unless I have a reason to share, I give each test its own records to change. If the records are read-only, I can share them without tests changing each other's starting point. I'd have the fixture return the exact record IDs for checks and cleanup.

### Example

I'd have a fixture create a pending reimbursement and remove it after the run. The `ReimbursementPage.approve()` method clicks the approval button. In the test itself, I'd check that the original reimbursement now shows approved.
