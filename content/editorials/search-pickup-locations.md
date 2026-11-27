---
problem: locator/search-pickup-locations
---

## What is going on

The page lets a customer search for a pickup point. It can also show a search box for orders or a separate tool for returns. The exercise asks for the input whose placeholder is `City or postcode`. The return tool can start its placeholder with the same words, so the full value matters.

## The fix

```ts
page.getByPlaceholder('City or postcode', { exact: true })
```

1. Find the input with the exact placeholder `City or postcode`.

   **Why:** In `order-lookup-first`, the leading field is for order numbers, but the pickup field keeps its placeholder. In `pickup-and-return-tools`, the pickup field gains a wrapper and its accessible name changes from `Location` to `Pickup location`. The placeholder stays the same, and the whole-value match rejects `City or postcode for returns` even when that field appears first.

The placeholder tells the customer which inputs make sense for their search. The exercise treats its wording as a contract, so it is useful even when these tools share the same input type. If the test goes on to search, a postcode with known pickup results makes it possible to check the outcome as well as the field selection.

## Why the tempting answer fails

The first search box is the pickup input in the original layout. In `order-lookup-first`, `.nth(0)` would enter a city or postcode into the order field. In `pickup-and-return-tools`, it would enter that data into the returns tool instead. Both shortcuts return a single search box, so verifying the count would miss either mistake.

## What the interviewer listens for

Explain why the placeholder is a suitable anchor here and when you would prefer a stable label or accessible name. If a product translates its placeholders or adds examples to them, exact matches on that wording have to account for the copy change.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
