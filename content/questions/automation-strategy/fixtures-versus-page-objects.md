---
title: What belongs in a fixture versus a page object?
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: Let fixtures own setup and cleanup; let page objects describe interactions a test can read.
looksFor:
  - Separate responsibility for state and UI actions
  - Test scope for mutable data
  - Ownership of cleanup
  - A spec that makes the behavior under test visible
trap: Creating database records as a side effect of constructing a page object.
followUps:
  - question: What would you share between workers?
    answer: I would consider read-only reference data; accounts or orders that tests edit need independent state.
sources:
  - label: Playwright fixtures
    url: https://playwright.dev/docs/test-fixtures
  - label: Playwright page object models
    url: https://playwright.dev/docs/pom
---

I use a fixture to answer what this test needs before it can begin and who cleans up afterward. A page object answers how I perform an interaction on the screen. A fixture can supply a page object, but I keep record creation out of the object's constructor. That way opening the settings page doesn't silently change anybody's settings.

I keep mutable records test-scoped unless there's a reason to do otherwise. I can share a read-only reference list without one test changing another test's starting point. The fixture should return the IDs the test needs for assertions and cleanup, so those operations can name the exact records.

### Example

I'd have a fixture create a pending reimbursement and remove that record after the test. `ReimbursementPage.approve()` clicks the relevant button. The spec checks that the original reimbursement is marked approved, so the expected transition is clear in one place.
