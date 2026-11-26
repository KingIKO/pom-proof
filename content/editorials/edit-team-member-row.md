---
problem: locator/edit-team-member-row
---

```ts
page.getByRole('row')
  .filter({ hasText: 'dana.song@example.test' })
  .getByRole('button', { name: 'Edit', exact: true })
```

The member's email identifies the row. Search for the Edit button only after the row is in scope. The Delete button can share the same cell without interfering, and a wrapper around the cell's actions does not change which row contains those actions.

The first Edit button is correct in the original table. Reverse sorting puts Eli Wong first, so the decoy can still return one button but would edit Eli. A second Dana Song appears above the target in the other variant. Switching from position to display name alone would give two candidate rows. The email stays with the intended member, even when the table headings are localized and the email sits inside a span.

In an interview, name the data assumption: the full email appears on just one member row in this table. A string `hasText` filter matches text anywhere in the row by substring. If the same address can also appear in a manager or invitation column, prefer a check of the actual email cell or a row identifier provided by the app.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
