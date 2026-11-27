---
problem: locator/delivery-region-field
---

## What is going on

Both address sections have a field called `Region`. The delivery value is used to estimate delivery dates, and the billing value belongs to a different address. Both fields can accept the same text. You need to identify the address group before filling its region, or a passing fill can leave the order with the wrong data.

## The fix

```ts
page.getByRole('group', { name: 'Delivery address', exact: true })
  .getByLabel('Region', { exact: true })
```

1. Find the group named exactly `Delivery address`.

   **Why:** In `billing-first`, the fieldsets swap positions, but each legend still names its own group. Starting in the delivery group keeps the billing field out of the search even though it is labeled `Region` too.

2. Find the field labeled exactly `Region` inside the delivery group.

   **Why:** In `delivery-extra-field`, a substring match would include `Region code` as well. The full label excludes that input. The locator follows the label's association with the matching control, so a new ID or additional wrapper has no effect when the label and input still agree.

## Why the tempting answer fails

The first exact `Region` match is the delivery field in the original form. In `billing-first`, the same expression fills the billing region. Exact matching resolves which field name to use, yet the first match still depends on which address happens to be rendered first. Dropping `exact: true` in `delivery-extra-field` would introduce another possible control within delivery itself, so the two restrictions solve different problems.

## What the interviewer listens for

Explain how the fieldset and legend let the test distinguish the two addresses the same way a customer does. Reopen the order after saving and check the delivery region separately from the billing region so a swap cannot pass unnoticed.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN HTML fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
- [MDN HTML label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
