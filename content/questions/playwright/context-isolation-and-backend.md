---
title: What does a fresh Playwright browser context isolate from the previous test?
topic: playwright
roles: [automation, sdet]
level: junior
type: concept
oneLine: A fresh context separates browser state, but data saved by the server still needs its own test strategy.
looksFor:
  - Cookies and browser storage belong to a context
  - A distinction between page and context
  - Backend records remain outside browser isolation
  - Tests can run independently and in a different order
trap: Assuming a fresh context resets an account's settings in the database.
followUps:
  - question: Why does a test pass only after another test?
    answer: I would check whether it assumes a record, login, or application state that the other test created, and make that prerequisite explicit.
sources:
  - label: Playwright test isolation
    url: https://playwright.dev/docs/browser-contexts
---

Playwright Test gives each test a fresh browser context by default. That keeps cookies and browser storage from one test from spilling into the next. A new page opened in the same context can still share session state, so opening another tab isn't an isolation strategy.

I'd also look at the server side. A fresh context can sign in as the same user, read the same settings, and find the consequences of earlier writes. I'd make every test prepare the state it needs and run it alone as a sanity check. I avoid tests that must run after another spec to start in the right state.

### Example

In a preferences suite I'd use a fresh context and a unique account for a check that changes the time zone. Running that check before or after the defaults check should produce the same result.
