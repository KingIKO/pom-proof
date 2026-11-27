---
problem: locator/booking-text-reminders
---

## What is going on

The booking form lets customers choose email reminders or text reminders. Both choices are checkboxes, and you can check either one without an error. A locator is an expression that finds an element on the page. If the test only checks the control it just used, a locator that picks the wrong checkbox may still let the test pass. The label names the customer's choice.

## The fix

```ts
page.getByLabel('Text reminders', { exact: true })
```

1. Find the form control linked to the exact label `Text reminders`.

   **Why:** In the `option-groups` layout, the caption moves into a span, and the input moves to the other side of it. A wrapper also surrounds the whole label. The checkbox is still inside its `label` element, so the two stay linked. The locator follows that link and returns the checkbox you can check. The new positions of the caption and the surrounding elements do not affect it.

The exact label also works in `email-option-first`. There the options swap places, but each label moves with its own checkbox. A nearby button or heading with similar text is not linked to the label, so the locator does not return it.

## Why the tempting answer fails

The tempting answer, `page.getByRole('checkbox').nth(0)`, takes the first checkbox on the page. It finds text reminders only while that option comes first. In `email-option-first` and `option-groups`, it finds the email checkbox.

Waiting or repeating the action does not help, because the locator always asks for the first option. You still get one match and a checked box. Neither result tells you that the customer signed up for text reminders.

## What the interviewer listens for

A role tells assistive tools, such as screen readers, what kind of control an element is. An accessible name is the name those tools read for it. Explain why either of two locators identifies the customer's choice. One is the exact label. The other is the checkbox role with the exact accessible name `Text reminders`.

For a full booking test, reopen the form after saving and check that the saved text preference is on. A checked box before saving does not prove that.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN HTML label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
