---
problem: locator/billing-email-field
---

## What is going on

The payment form has two email fields. The billing address receives receipts. The account address serves a different purpose. Both fields accept the same valid email, so filling one successfully cannot prove you picked the right field. Start with the label the customer reads before typing.

## The fix

```ts
page.getByLabel('Billing email', { exact: true })
```

1. Find the input by its exact `Billing email` label.

   **Why:** In `regenerated-field-ids`, the label's `for` attribute and the input's ID change together. The `getByLabel` locator follows that link on the current page to find the input you can fill. In `reversed-with-input-wrapper`, a wrapper separates the label from the input in the markup, but their link stays the same. The label still reads `Billing email`. The exact match can still use the whole label.

The ID lets the label refer to its input in the same document. The test can use that link without remembering the ID from the last time the form appeared.

## Why the tempting answer fails

The inspector finds exactly one match for `#contact-891`. In `regenerated-field-ids`, the billing input becomes `contact-951`, so that selector finds nothing. In `reversed-with-input-wrapper`, the old ID is gone again.

Guessing by field order would fill the account email first. Looking for the input immediately after the label would miss the input inside the wrapper.

## What the interviewer listens for

Explain why the address that receives receipts matters. Show how the locator, an expression that finds a page element, finds that field. If two panels contain `Billing email`, find the right panel by name before you look for the field. If the label stops pointing to the input, report the broken link.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN HTML label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
