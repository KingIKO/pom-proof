---
problem: locator/billing-email-field
---

## What is going on

The payment form has two email fields. The billing address receives receipts, and the account address serves a different purpose. A test can fill either input with the same valid email, so success at the fill step gives you no evidence that the address went into the right field. Start from the text the customer reads before typing.

## The fix

```ts
page.getByLabel('Billing email', { exact: true })
```

1. Use the exact `Billing email` label to find the input associated with it.

   **Why:** In `regenerated-field-ids`, the label's `for` value and the input's ID change together. `getByLabel` follows that association on the current page and returns the input you can fill. In `reversed-with-input-wrapper`, the wrapper separates the label and input in the markup without changing that link. The label is still `Billing email`, so an exact match can continue to use the full field name.

The ID has a job in the form: it allows the label to refer to its input in the same document. The test can rely on that relationship without carrying the ID from one render into the next.

## Why the tempting answer fails

The inspector shows a unique match for `#contact-891`, but the billing input becomes `contact-951` in `regenerated-field-ids`. The selector finds nothing there. In `reversed-with-input-wrapper`, the old ID is gone again. Guessing from field order would fill the account email first, and assuming the billing input immediately follows its label would miss the input inside the wrapper.

## What the interviewer listens for

Explain why the receipt destination matters and how the locator finds that field. If two panels contain `Billing email`, scope by panel name first. If the label stops pointing to the input, report the broken form association.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN HTML label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
