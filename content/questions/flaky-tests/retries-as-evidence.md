---
title: "Why not add retries to a test that fails only sometimes?"
topic: flaky-tests
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I use a retry to get more evidence. A passing retry doesn't tell me why the first attempt failed."
looksFor:
  - "Explain how a pass on retry can hide a bug customers see."
  - "Tell a whole-test retry apart from waiting for one expected result."
  - "Keep the first result visible even if the retry passes."
  - "Use the evidence to pick what to investigate and fix."
trap: "Adding retries until the job passes and counting only the final result."
followUps:
  - question: "When would another attempt help you?"
    answer: "I'd retry to collect more evidence or see if the failure happens every time under those conditions. I'd still report the original failure."
sources:
  - label: Playwright retries
    url: https://playwright.dev/docs/test-retries
---

A retry gives me another result to compare. Playwright calls a test flaky when it fails first and passes on retry. I keep the first result visible. A customer may see the same timing bug and won't get a fresh browser session just because our test did.

I distinguish retrying the whole test from waiting for one thing to happen inside it. If the page needs time to finish an export, I wait for the same sign the user sees when the file is ready. If an export sometimes goes missing, I'd still investigate the product even when another attempt passes.

### Example

If search fails on its first attempt, I compare the inputs and results from both attempts. If my test checks before results arrive, I'd fix the test. If valid searches sometimes return the wrong rows, I'd report a product bug.
