---
title: How would you use Playwright to test the UI when a request returns an error?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Register a narrow route before the request and return a controlled error that lets you check the recovery path.
looksFor:
  - Register routing before the relevant request
  - Match the exact request needed for the case
  - Assert the user's recovery and resulting state
  - Keep separate evidence for the real service
trap: Mocking every request and calling the resulting browser test proof of the whole integration.
followUps:
  - question: How would you check recovery?
    answer: I'd make the failing response apply to the first intended request, allow the next attempt to succeed under controlled conditions, and verify the UI reflects the outcome.
sources:
  - label: Playwright mock APIs
    url: https://playwright.dev/docs/mock
  - label: Playwright network
    url: https://playwright.dev/docs/network
---

I'd register `page.route` before the page or user action can send the request. I'd match the endpoint and, when the same URL serves several actions, check the HTTP method too. For the request I want to fail, `route.fulfill` can return a chosen status and body. I leave unrelated requests alone so the test has fewer assumptions.

The goal is a user outcome: can someone tell what happened and safely recover? A controlled response makes a rare failure repeatable. I keep a separate check against the real service because this test doesn't show that the service returns that response in production.

### Example

For a temporary shipping quote error, I'd return 503 for the quote call. I check that the address stays filled in, the page offers a retry, and a controlled successful retry displays the quote.
