---
problem: locator/approve-timesheet-test-id
---

## What is going on

Every timesheet has an approval button, and the app repeats `approve-timesheet` once per section. That hook identifies what the button does. To approve Jules Carr's timesheet `T-291`, the test also needs the record's identity. An employee can have more than one timesheet, so even finding the right person can leave the test on the wrong week.

## The fix

```ts
page.getByRole('region', { name: 'Timesheet T-291', exact: true })
  .getByTestId('approve-timesheet')
```

1. Scope to the region whose accessible name is exactly `Timesheet T-291`.

   **Why:** In `localized-toolbar-and-new-entry`, Jules has another timesheet and the visible week text is translated. The app keeps the section's accessible name tied to the timesheet number, so the region still singles out the right entry even when the surrounding copy and element IDs change.

2. Find `approve-timesheet` by test ID inside that region.

   **Why:** In `localized-toolbar-and-new-entry`, the button reads `Approuver` and sits inside a new toolbar wrapper. The test ID travels with the action. Chaining it after the region restricts the lookup to that timesheet, so the identical hooks on other cards never enter the result.

## Why the tempting answer fails

Taking the first approval test ID works while `T-291` is first. In `sorted-by-hours`, the longest work week comes first and the decoy would approve Sam Lau's `T-292`. In `localized-toolbar-and-new-entry`, it would approve Jules's `T-301`. In both layouts the decoy can still return one actionable button. A check that an approval message appeared would leave the important question open: which entry did the app approve?

## What the interviewer listens for

Explain when a repeated test ID is useful: one matching action inside an unambiguous parent is enough for this pattern. If two approval hooks appear inside that parent, investigate the repeated action or improve the app's testing contract before choosing by index.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
