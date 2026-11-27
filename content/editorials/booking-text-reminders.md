---
problem: locator/booking-text-reminders
---

## What is going on

The booking form lets customers choose email reminders or text reminders. Both choices are checkboxes and either one can be checked successfully. A locator that picks the wrong one may still make a test look green if the test only checks the control it just used. The customer's choice is identified by its label.

## The fix

```ts
page.getByLabel('Text reminders', { exact: true })
```

1. Find the form control associated with the exact label `Text reminders`.

   **Why:** In `option-groups`, the caption moves into a span, the input moves to the other side of the caption, and a wrapper surrounds the whole label. The checkbox is still inside its `label`. That association makes the locator return the checkbox you can check, even though the position of the caption and the surrounding elements has changed.

The exact label also works in `email-option-first`: the labels travel with their own checkboxes when the options swap places. A button or heading nearby with similar text would not become the form control for that label.

## Why the tempting answer fails

`page.getByRole('checkbox').nth(0)` finds text reminders only while they come first. It finds the email checkbox in `email-option-first` and `option-groups`. Waiting or repeating the action can still leave you with a single match and a checked box, because the locator consistently asks for the first option. Neither check tells you that the customer signed up for text reminders.

## What the interviewer listens for

Explain why the exact label or the checkbox role with the exact accessible name `Text reminders` identifies the customer's choice. For a full booking test, reopen the form and verify that the saved text preference is on; a checked box before saving does not establish that.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN HTML label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
