---
title: Checkout opens a browser for every postal code. Which checks would you move out of the merge job's browser run?
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: Keep the browser check for the shopper's handoff and prove a wrong quote still blocks the merge once pricing cases move to the API.
looksFor:
  - Keeps the browser case that proves the quote reaches confirmation.
  - Shows that the API cases catch the postal-code pricing mistakes.
  - Uses the timing breakdown to decide whether repeated setup or browser runs dominate.
  - Measures time and cost after the change and isolates data before trying parallel jobs.
trap: Buying more parallel execution when every job spends most of its time doing the same setup.
followUps:
  - question: Pricing now passes at the API, but the shipping total shown on confirmation is wrong. Does the new merge job still catch it?
    answer: It should fail the browser check that compares the quote with the confirmation. I'd prove that with a deliberate mismatch before moving lower-risk combinations to an owned scheduled or release suite.
sources:
  - label: Playwright sharding and how work is split
    url: https://playwright.dev/docs/test-sharding
  - label: GitHub Actions dependency caching
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching
---

I'd keep a browser case for the path from quote to confirmation and put the postal-code
pricing and rounding combinations below it where the rules can be checked just as well.
I'd show that a known wrong price still fails a required check.

Then I'd time the 30-minute job by queue, setup, tests, and reporting. If every case builds
the same catalog, I'd build it once and isolate the checkout records. If installation
dominates, I'd cache locked dependency downloads. I'd try parallel jobs only when the cases
can run together, and compare feedback time and runner minutes afterward.

### Example

If the suite opens a browser for every postal code, I'd check the pricing combinations at the API and keep a browser case for checkout quoting and confirmation. A deliberate pricing regression should still fail the required check.
