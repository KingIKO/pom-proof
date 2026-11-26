---
title: How would you choose between Playwright, Selenium, and Cypress?
topic: automation-strategy
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: Compare supported browsers, team experience, and the real flows you need, then test the short list in CI.
looksFor:
  - Required browser, version, and operating system combinations
  - Existing suite and team skills as real migration costs
  - A flow that exposes tool differences
  - Measured diagnostics and execution cost
trap: Picking by a speed claim from someone else's suite or rewriting a working suite on reputation alone.
followUps:
  - question: What would make you keep Selenium?
    answer: A stable Java suite running against required remote browser and operating system combinations can outweigh the convenience of migrating.
sources:
  - label: Playwright browsers
    url: https://playwright.dev/docs/browsers
  - label: Selenium Grid
    url: https://www.selenium.dev/documentation/grid/
  - label: Cypress cross-browser testing
    url: https://docs.cypress.io/app/guides/cross-browser-testing
  - label: Cypress component testing
    url: https://docs.cypress.io/app/component-testing/get-started
  - label: Playwright introductory guide
    url: https://playwright.dev/docs/intro
---

First I ask what browser and OS versions we actually promise to support. For a TypeScript team starting fresh, I'd try Playwright Test because its runner, browser support, and failure tools fit together. I'd consider Selenium if the team already owns a Java suite and needs remote sessions for specific browser and OS combinations. I'd trial Cypress if the frontend team already uses it to mount and test components in a browser and wants to keep that workflow.

I don't start with a rewrite. I run the same representative checks in CI and compare time to implement, first-attempt reliability, and how long it takes someone else to diagnose a failed run. If a supported browser is missing, fast results can't make up for that.

### Example

For an account portal I'd trial a sign-in redirect and a report download before picking. I'd also make the pilot fail on purpose once and see which run output the on-call teammate can act on.
