---
title: How would you choose between role, CSS, and XPath when finding an element?
topic: locators-waits
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I start with a user-facing role and name. If the interface gives me no useful handle, I use a stable test ID or a scoped selector.
looksFor:
  - Explain why a role and an accessible name express what the user is trying to do.
  - Show how to scope a label that appears more than once.
  - Give a reasonable case for CSS or XPath.
  - Explain why selectors based on DOM positions break.
trap: Copying the inspector's XPath from the top of the page just because the current layout makes it work.
followUps:
  - question: If each invoice row has a Refund button, how would you make sure the test clicks the one for A104?
    answer: I'd look for the button's role and name only inside the row that displays A104. I'd still require one match within that row.
  - question: A new element around the table breaks the XPath you copied for invoice A104. Which part of the XPath would you keep?
    answer: If the selector has a meaningful attribute, I'd keep it. I'd drop the path from the page root to the row that the inspector recorded. Inside A104's row, I could use `.//button[@data-action='refund']` without naming the wrappers.
sources:
  - label: Playwright locators
    url: https://playwright.dev/docs/locators
  - label: W3C XPath 1.0 location paths
    url: https://www.w3.org/TR/1999/REC-xpath-19991116/#location-paths
---

A locator tells the test how to find an element. For a button, I start with its role and accessible name. The role says what kind of control it is. The accessible name is the label that assistive technology reads out. Together they describe what a customer operates.

Because of that, adding a wrapper or changing a styling class shouldn't break the test. If an icon-only action has no name, a role locator also gives me a reason to investigate. A passing role locator alone doesn't prove the page is accessible.

The relevant text may change by language, or the widget may have no useful user-facing handle. In either case, I ask for a test ID or use CSS scoped to a stable attribute.

XPath can express relationships in a legacy DOM, the tree of elements in an older page. I'd keep the XPath local, starting from a nearby element, and avoid hard-coded positions. When two matches make sense to a user, I give the locator the same context the user has.

### Example

For a refunds table, I first find the row for invoice A104. Then I find the Refund button in that row. A new row above it won't send my test to a different invoice.
