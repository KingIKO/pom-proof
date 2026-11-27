---
title: A Java Selenium suite takes forty minutes. How would you pilot Playwright?
topic: framework-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Measure the existing suite, run a representative pilot in parallel, and migrate by verified coverage.
looksFor:
  - Measures reliability, duration, diagnosis, and migration cost.
  - Includes a hard flow from the real browser matrix.
  - Rewrites tests using Playwright locators and assertions.
  - Defines the evidence required to retire old checks.
trap: Translating every test line by line before proving the new suite can cover the required browsers.
followUps:
  - question: The new invoice export test runs faster, but only Selenium can run it on a required browser build. Would you remove the Selenium case?
    answer: I'd keep that run in Selenium until its browser coverage has a verified replacement or the support policy changes. Then I'd check whether the faster runs justify maintaining both versions in the meantime.
sources:
  - label: Playwright locators
    url: https://playwright.dev/docs/locators
  - label: Playwright assertions
    url: https://playwright.dev/docs/test-assertions
  - label: Playwright browser support
    url: https://playwright.dev/docs/browsers
---

I'd measure where the forty minutes go, how many checks pass on the first attempt, and how long a failure takes to diagnose. Then I'd choose a slice that includes a routine flow and a hard one, and confirm we can still test the required browsers. In the pilot I'd write user-facing locators and retrying assertions where they fit instead of carrying over every explicit wait.

I'd run both suites on the same changes and show that the new checks catch the important known failures. I would remove redundant cases instead of porting them all. I'd retire each old slice once the replacement handles its risk, runs reliably in CI, and has an owner.

### Example

I might pilot sign-in and a delayed invoice export. If the export suite is slow because the service takes minutes to prepare the file, changing browser libraries alone won't make that wait disappear.
