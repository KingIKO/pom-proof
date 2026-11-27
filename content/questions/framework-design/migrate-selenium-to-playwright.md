---
title: "A Java Selenium suite takes forty minutes. How would you try Playwright before switching?"
topic: framework-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I measure the existing tests and try a representative set in both tools. I remove an old test only after its replacement proves it covers the risk."
looksFor:
  - "Measure run time, first-attempt passes, time to find the cause, and cost to move the tests."
  - "Include a difficult flow on browsers the team actually supports."
  - "Use Playwright's ways of finding elements and checking their state."
  - "Say what evidence you need before removing old tests."
trap: "Copying every Selenium step before proving Playwright can test the required browsers."
followUps:
  - question: "Invoice export runs faster in Playwright, but only Selenium runs it on a required browser build. Would you remove it?"
    answer: "I'd keep that run in Selenium until a verified replacement covers that browser or the support policy changes. I'd check whether the faster runs justify keeping both versions in the meantime."
sources:
  - label: Playwright locators
    url: https://playwright.dev/docs/locators
  - label: Playwright assertions
    url: https://playwright.dev/docs/test-assertions
  - label: Playwright browser support
    url: https://playwright.dev/docs/browsers
---

I'd measure where the forty minutes go. I'd count first-attempt passes and time how long a failure takes to explain. I'd choose a routine flow and a difficult one for the pilot, a small trial before switching. I'd check that I can still test the required browsers.

I'd write locators that find controls by what users see, such as names. Where it fits, I'd use retrying assertions, checks that try again while the page updates, instead of copying every wait. I'd run both suites on the same changes and show that the new tests catch important known failures. I'd remove duplicates instead of moving them all. I'd retire each old group after its replacement covers the risk, passes reliably in automated runs, and has an owner.

### Example

I might try sign-in and a delayed invoice export. If the service takes minutes to prepare the file, switching browser tools alone won't make my export test stop waiting for it.
