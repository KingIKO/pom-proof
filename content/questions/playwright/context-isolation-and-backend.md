---
title: What does a fresh Playwright browser context keep separate between tests?
topic: playwright
roles: [automation, sdet]
level: junior
type: concept
oneLine: I use a fresh context to keep browser data separate. I still set up server data for each test.
looksFor:
  - Explain that cookies and saved browser data belong to the context.
  - Explain how a page fits inside a context.
  - Point out that a fresh context leaves server records unchanged.
  - Show that tests can run alone or in a different order.
trap: Expecting a fresh context to reset account settings the server already saved.
followUps:
  - question: Where would you look if a test only passes after another test runs?
    answer: I'd check whether the earlier test creates a record, signs in, or leaves the app in a state the later test needs. I'd make the later test's setup declare that requirement.
sources:
  - label: Playwright test isolation
    url: https://playwright.dev/docs/browser-contexts
---

I get a fresh browser context for each test by default in Playwright Test. A context groups pages that can share browser data. It keeps cookies and other browser storage separate from the next test. Tabs in the same context can share session state, such as whether I'm signed in. Opening another tab in that context doesn't isolate my test.

I'd check what the server stores too. If I sign in as the same user in a fresh context, I can still see the same saved settings. I can also see the effects of earlier writes, such as records another test changed. I'd make each test prepare the state it needs. I'd run it alone to check it works without another test going first.

### Example

If I test changing the time zone, I'd use a fresh context and an account just for that test. I'd expect the result to be the same whether I run it before or after the test for default preferences.
