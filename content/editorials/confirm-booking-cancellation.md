---
problem: locator/confirm-booking-cancellation
---

## What is going on

The page can ask the customer to confirm a booking cancellation while a separate notification prompt is also waiting for confirmation. Both use the caption `Confirm`. The booking number is in the cancellation dialog's name, so the identity of the action comes from the dialog and the button together.

## The fix

```ts
page.getByRole('dialog', { name: 'Cancel booking BK-281?', exact: true })
  .getByRole('button', { name: 'Confirm', exact: true })
```

1. Start inside the dialog named exactly `Cancel booking BK-281?`.

   **Why:** In `hidden-draft-and-new-toolbar`, the hidden draft has the same name, but role matching excludes it by default. The visible dialog gets its name from the heading through `aria-labelledby`. The heading ID can change, as it does in `notification-confirmation-added`, as long as the attribute points to the correct heading in that render.

2. Find the button named exactly `Confirm` within that dialog.

   **Why:** In `hidden-draft-and-new-toolbar`, `Confirm` gains a wrapper and moves ahead of `Go back`. Chaining the button lookup keeps it inside the booking dialog regardless of the order of its controls or how deeply they are nested. The notification button sits outside that scope.

## Why the tempting answer fails

Taking the first button named `Confirm` is enough with only one prompt. In `notification-confirmation-added` and `hidden-draft-and-new-toolbar`, a visible notification confirmation comes first. The decoy still returns a button you can act on, but it answers the question about sending a schedule update. A test that only checks that a prompt cleared could pass while the actual booking remains in place.

## What the interviewer listens for

Explain how the dialog name supplies the meaning that a shared caption leaves out. Then describe an assertion that checks the state of `BK-281` after confirmation rather than only checking that a prompt disappeared.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright role visibility option](https://playwright.dev/docs/api/class-page#page-get-by-role-option-include-hidden)
