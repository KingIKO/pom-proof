---
problem: locator/edit-team-member-row
---

## What is going on

The team table gives every member row an `Edit` button. A sort can move any row to the top, and two members can both display the name `Dana Song`. The email `dana.song@example.test` stays with the intended member. Find the member first so the test can tell exactly whose details it would change.

## The fix

```ts
page.getByRole('row')
  .filter({ hasText: 'dana.song@example.test' })
  .getByRole('button', { name: 'Edit', exact: true })
```

1. Start from the table rows by role.

   **Why:** In `sorted-by-name-descending`, the member moves but the row still groups their email and actions. That gives the test a place to search for a record without assuming how the rows are sorted.

2. Keep the row containing `dana.song@example.test`.

   **Why:** In `second-dana-and-action-wrappers`, the member above the target shares the display name but has a different email. The text filter can still find the right email inside a span, independently of the localized headings.

3. Find the exact `Edit` button inside that row.

   **Why:** In `second-dana-and-action-wrappers`, the cell wraps `Edit` and `Delete` together. A descendant lookup reaches both controls, then the name picks the requested action without relying on their order.

## Why the tempting answer fails

The first `Edit` button is correct in the original table. In `sorted-by-name-descending`, it would edit Eli Wong. In `second-dana-and-action-wrappers`, it would edit the other Dana Song, and a filter on the display name alone would still leave two rows. In each case the decoy returns one button despite identifying the wrong person.

## What the interviewer listens for

Explain that string `hasText` matches a substring anywhere in a row and that the full email occurs in only one row here. If it could also appear in a manager or invitation column, match the actual email cell or use an app-provided row identifier.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
