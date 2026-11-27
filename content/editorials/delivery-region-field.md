---
problem: locator/delivery-region-field
---

## What is going on

Both address sections have a field called `Region`. The app uses the delivery region to estimate delivery dates. The billing region belongs to a different address. Both fields accept the same text, so filling the wrong one does not cause an error. Identify the address group before you fill its region, or the order can end up with the wrong data.

## The fix

```ts
page.getByRole('group', { name: 'Delivery address', exact: true })
  .getByLabel('Region', { exact: true })
```

1. Find the group named exactly `Delivery address`.

   **Why:** A fieldset is the HTML element that groups related fields. Its legend is the caption, and the browser uses it as the group's name. In the `billing-first` layout, the two fieldsets swap places, but each legend still names its own group. Starting in the delivery group keeps the billing field out of the search, even though it is labeled `Region` too.

2. Find the field labeled exactly `Region` inside the delivery group.

   **Why:** In `delivery-extra-field`, a match on part of the label would also find `Region code`. Matching the full label leaves that input out. The locator, the expression that finds the field, follows the link between each label and its control. So a new ID or an extra wrapper changes nothing, as long as the label and input are still linked.

## Why the tempting answer fails

The tempting answer takes the first field labeled exactly `Region`. In the original form, that is the delivery field. In `billing-first`, the same expression fills the billing region. Exact matching settles which label to look for. But the first match still depends on which address the page happens to show first.

Dropping `exact: true` causes a different problem. In `delivery-extra-field`, it would add another possible field inside the delivery group itself. So the group scope and the exact match solve different problems.

## What the interviewer listens for

Explain how the fieldset and legend let the test tell the two addresses apart, the same way a customer does. After saving, reopen the order. Check the delivery region separately from the billing region, so a swap between them cannot go unnoticed.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN HTML fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
- [MDN HTML label](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)
