---
title: "Checkout opens a browser for every postal code. Which tests could leave the browser run before merge?"
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "I keep a browser test for the shopper's path to confirmation. I prove that checking postal-code prices directly still blocks a wrong quote before merge."
looksFor:
  - "Keep a browser test that proves the quote reaches the confirmation screen."
  - "Show that tests at the pricing service catch postal-code mistakes."
  - "Measure whether setup or browser tests account for most of the wait."
  - "Compare time and cost afterward, and separate test data before running jobs together."
trap: "Paying for more jobs when each one spends most of its time repeating the same setup."
followUps:
  - question: "The price test passes at the API, but confirmation shows the wrong shipping total. Does the merge job catch it?"
    answer: "I expect the browser check that compares the quote with confirmation to fail. I'd prove it by making those totals differ on purpose. Then I'd move lower-risk combinations to a scheduled or release suite with an owner."
sources:
  - label: Playwright sharding and how work is split
    url: https://playwright.dev/docs/test-sharding
  - label: GitHub Actions dependency caching
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching
---

I'd keep one browser test from quote to confirmation. I'd move postal-code pricing and rounding combinations to the API, where a test can ask the service for prices directly. I'd make the price wrong on purpose to prove it still fails a required check.

I'd split the 30-minute job into time spent waiting to start, setting up, running tests, and reporting. If every case builds the same catalog, I'd build it once and give tests separate checkout records. If package installation takes most of the time, I'd reuse downloaded files for the locked package versions. I'd only run jobs together when the cases can safely overlap. I'd compare time to get a result and total runner minutes afterward.

### Example

If my suite starts a browser for each postal code, I'd test the price combinations at the API. I'd keep a browser test for the quote and confirmation. When I cause a pricing bug on purpose, I expect a required check to fail.
