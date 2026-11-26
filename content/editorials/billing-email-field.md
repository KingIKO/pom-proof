---
problem: locator/billing-email-field
---

```ts
page.getByLabel('Billing email', { exact: true })
```

Use the label the customer reads before entering an address. The label's `for` value points to an input ID in the same document. `getByLabel` follows that association and returns the input, which is the element a test would fill. The ID only needs to agree with the label on the page that is currently open.

`#contact-891` is tempting because the inspector shows a unique match. The next render assigns `contact-951` instead, so the selector finds nothing. In the reordered form, the account email moves above the billing email and a wrapper sits between the billing label and input. A selector that guesses from field order or assumes the input immediately follows the label would also break. The label association still works in both cases.

In an interview, explain where receipts go and why filling the account field would be a different action. If two panels both contain `Billing email`, scope by the panel name before selecting the field. If the label stops pointing to the input, raise that as a form defect.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
