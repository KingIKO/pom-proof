---
problem: locator/edit-team-member-row
---

## What is going on

The team table gives every member row an `Edit` button. Sorting can move any row to the top. Two members can also both show the name `Dana Song`. The email `dana.song@example.test` stays with the intended member. Find the member first, so the test knows exactly whose details it would change.

## The fix

```ts
page.getByRole('row')
  .filter({ hasText: 'dana.song@example.test' })
  .getByRole('button', { name: 'Edit', exact: true })
```

1. Start from the table rows by their `row` role.

   **Why:** A role is the kind of element the browser reports to assistive tools, such as row or button. In the `sorted-by-name-descending` layout, the member moves. The row still keeps their email and buttons together. So the test has a place to search for one record without assuming how the rows are sorted.

2. Keep the row containing `dana.song@example.test`.

   **Why:** In `second-dana-and-action-wrappers`, the member above the target has the same display name but a different email. The text filter still finds the right email inside a span. The translated column headings do not affect it.

3. Find the button named exactly `Edit` inside that row.

   **Why:** In `second-dana-and-action-wrappers`, one wrapper holds both `Edit` and `Delete` inside the cell. A descendant lookup searches every element nested in the row, so it reaches both buttons. Then the name picks the requested button without relying on their order.

## Why the tempting answer fails

The tempting answer takes the first `Edit` button on the page. That is correct in the original table. In `sorted-by-name-descending`, it would edit Eli Wong. In `second-dana-and-action-wrappers`, it would edit the other Dana Song. A filter on the display name alone would still leave two rows there.

In each case, the tempting answer returns one button, but for the wrong person.

## What the interviewer listens for

Explain that `hasText` with a string matches that text anywhere in a row, even as part of longer text. Here the full email appears in only one row. If it could also appear in a manager or invitation column, match the actual email cell. You could also use a row identifier that the app provides.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
