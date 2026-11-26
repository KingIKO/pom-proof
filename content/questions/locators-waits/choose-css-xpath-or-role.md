---
title: When would you use a role locator, CSS, or XPath?
topic: locators-waits
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Start with a user-facing role and name, then use a stable test ID or a scoped selector if the interface gives you no useful handle.
looksFor:
  - Why role and accessible name express user intent
  - How to scope a repeated label
  - A reasonable case for CSS or XPath
  - An explanation of why DOM positions break
trap: Copying an absolute XPath from the inspector because it happens to work on the current page.
followUps:
  - question: What if the page has two Save buttons?
    answer: I'd scope the search to the named dialog or region that owns the action and still require a single match.
sources:
  - label: Playwright locators
    url: https://playwright.dev/docs/locators
---

For a button I start with its role and accessible name. That describes what a customer operates, so adding a wrapper or changing a styling class shouldn't break the test. A role locator also gives me a reason to investigate if an icon-only action has no name. A passing role locator alone doesn't prove the page is accessible.

If the relevant text changes by language or the widget has no useful user-facing handle, I ask for a test ID or use CSS scoped to a stable attribute. XPath can express relationships in a legacy DOM, though I'd keep it local and avoid hard-coded positions. When two matches make sense to a user, I give the locator the same context the user has.

### Example

For a refunds table I first find the row for invoice A104, then its Refund button. A new row above it won't send my test to a different invoice.
