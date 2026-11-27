---
problem: locator/confirm-booking-cancellation
---

## What is going on

The page can ask the customer to confirm a booking cancellation. At the same time, a separate notification prompt can also wait for confirmation. Both prompts have a button with the caption `Confirm`. The booking number is in the cancellation dialog's accessible name, the name the browser reports to assistive tools such as screen readers. So you need the dialog and the button together to know which action you found.

## The fix

```ts
page.getByRole('dialog', { name: 'Cancel booking BK-281?', exact: true })
  .getByRole('button', { name: 'Confirm', exact: true })
```

1. Start inside the dialog named exactly `Cancel booking BK-281?`.

   **Why:** In the `hidden-draft-and-new-toolbar` layout, a hidden draft dialog has the same name. Role matching finds elements by their kind and accessible name, and it skips hidden elements by default. The visible dialog takes its name from its heading through the `aria-labelledby` attribute. The heading's ID can change, as it does in `notification-confirmation-added`. The name still works as long as the attribute points to the correct heading each time the page renders.

2. Find the button named exactly `Confirm` within that dialog.

   **Why:** In `hidden-draft-and-new-toolbar`, `Confirm` gets a wrapper and moves ahead of `Go back`. Chaining runs the button lookup on the dialog's result, so the search stays inside the booking dialog. The order of the buttons and how deeply they are nested do not matter. The notification's button is outside the dialog, so the search does not reach it.

## Why the tempting answer fails

The tempting answer takes the first button named `Confirm`. That is enough when the page shows only one prompt. In `notification-confirmation-added` and `hidden-draft-and-new-toolbar`, a visible notification confirmation comes first. It still returns a button you can act on. But that button answers the question about sending a schedule update.

Suppose a test only checks that a prompt went away. It could pass while the actual booking is still in place.

## What the interviewer listens for

The shared caption `Confirm` does not say what is being confirmed. Explain how the dialog name adds that meaning. Then describe an assertion, a check in the test, that looks at the state of `BK-281` after confirmation. Checking only that a prompt disappeared is not enough.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright role visibility option](https://playwright.dev/docs/api/class-page#page-get-by-role-option-include-hidden)
