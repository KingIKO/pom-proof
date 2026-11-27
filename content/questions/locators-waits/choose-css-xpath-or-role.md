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
  - question: Every invoice row has a Refund button. What would make you confident the test will click A104's button?
    answer: I'd scope the button's role and name to the row that displays A104 and still require one match within it.
  - question: An added table wrapper broke the XPath copied for invoice A104. What would you keep from that selector?
    answer: I'd keep a meaningful attribute if there is one and drop the root-to-row path the inspector recorded. Inside A104's row I could use `.//button[@data-action='refund']` without naming the wrappers.
sources:
  - label: Playwright locators
    url: https://playwright.dev/docs/locators
  - label: W3C XPath 1.0 location paths
    url: https://www.w3.org/TR/1999/REC-xpath-19991116/#location-paths
---

For a button I start with its role and accessible name. That describes what a customer operates, so adding a wrapper or changing a styling class shouldn't break the test. A role locator also gives me a reason to investigate if an icon-only action has no name. A passing role locator alone doesn't prove the page is accessible.

If the relevant text changes by language or the widget has no useful user-facing handle, I ask for a test ID or use CSS scoped to a stable attribute. XPath can express relationships in a legacy DOM, though I'd keep it local and avoid hard-coded positions. When two matches make sense to a user, I give the locator the same context the user has.

### Example

For a refunds table I first find the row for invoice A104, then its Refund button. A new row above it won't send my test to a different invoice.
