---
problem: locator/approve-timesheet-test-id
---

## What is going on

Every timesheet has one approval button with the `approve-timesheet` test ID, an identifier for tests. The test ID tells you what the button does. To approve Jules Carr's timesheet `T-291`, the test must also find that record. An employee can have more than one timesheet, so the right employee can still lead you to the wrong week.

## The fix

```ts
page.getByRole('region', { name: 'Timesheet T-291', exact: true })
  .getByTestId('approve-timesheet')
```

1. Find the region whose accessible name is exactly `Timesheet T-291`.

   **Why:** An accessible name is the name the browser exposes to assistive tools. In `localized-toolbar-and-new-entry`, Jules has another timesheet and the visible week text appears in another language. The app bases the section's accessible name on the timesheet number. That name still singles out the right entry when nearby text and element IDs change.

2. Find `approve-timesheet` by test ID inside that region.

   **Why:** In `localized-toolbar-and-new-entry`, a new toolbar wraps the button and it reads `Approuver`. The same test ID still identifies that action. Searching only inside the region limits the result to that timesheet, so matching test IDs from other cards stay out.

## Why the tempting answer fails

If `T-291` is first, taking the first approval test ID works. In `sorted-by-hours`, the longest work week comes first, so the decoy would approve Sam Lau's `T-292`. In `localized-toolbar-and-new-entry`, it would approve Jules's `T-301`. In both layouts the decoy can return one usable button. An approval message alone would leave you unsure which entry the app approved.

## What the interviewer listens for

Explain when a repeated test ID is useful: this pattern needs one matching action inside a region you can identify exactly. If two approval test IDs appear in that region, investigate the duplicate action or improve how the app identifies each button before using its position.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
