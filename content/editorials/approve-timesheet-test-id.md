---
problem: locator/approve-timesheet-test-id
---

```ts
page.getByRole('region', { name: 'Timesheet T-291', exact: true })
  .getByTestId('approve-timesheet')
```

Treat `approve-timesheet` as a hook on each card, where it names the action rather than the record. The section's accessible name gives the record identity. By chaining a region locator and the test ID, the answer says exactly whose entry would be approved and keeps the action independent of its translated caption.

The first approval test ID works when Jules's `T-291` is first. With the longest work week first, it selects Sam's entry instead. With the new week added, it selects another timesheet from Jules. A replacement that scopes by employee name would still be ambiguous in that layout. The app keeps `Timesheet T-291` as the section name even when the week text and the approval button are translated.

An interviewer may ask whether test IDs have to be globally unique. Explain that repeated hooks need an unambiguous parent scope for this pattern. If you met the same ID twice inside that scope, investigate the repeated action or improve the app's testing contract before choosing one by index.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
