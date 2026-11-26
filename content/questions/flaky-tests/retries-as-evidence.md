---
title: Why not just add retries to a flaky test?
topic: flaky-tests
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: A retry can collect evidence, but the passing attempt can't explain why the first attempt failed.
looksFor:
  - A pass on retry can hide a customer-facing defect
  - A distinction between retrying a test and waiting for a condition
  - First-attempt outcomes remain visible
  - A concrete path to eliminating the cause
trap: Increasing retries until the CI badge is green and measuring only the final result.
followUps:
  - question: When could a retry be useful?
    answer: I'd use a retry to collect diagnostic evidence or distinguish an intermittent failure from a repeatable one, while still showing the original failure.
sources:
  - label: Playwright retries
    url: https://playwright.dev/docs/test-retries
---

A retry can be useful evidence. Playwright labels a test flaky when it fails initially and passes on retry. I keep that first result visible because a customer may hit the same timing bug and won't get a new browser session just because CI did.

I'd separate retrying the entire test from waiting for an expected state within the test. If the UI needs time to show a completed export, I wait for the state that tells the user the file is ready. If an export genuinely goes missing occasionally, a second clean run doesn't erase the defect.

### Example

If a search test fails on its first attempt, I compare the inputs and results of both attempts. I'd fix a test that asserts before results arrive, but file a product bug if correct queries are sometimes returning the wrong rows.
