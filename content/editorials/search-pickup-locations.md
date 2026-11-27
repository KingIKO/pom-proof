---
problem: locator/search-pickup-locations
---

## What is going on

The page lets a customer search for a pickup point. It can also show a search box for orders or a separate tool for returns. The exercise asks for the input whose placeholder is `City or postcode`. A placeholder is the hint text shown inside an empty input. The return tool can start its placeholder with the same words, so the full value matters.

Each input also has an accessible name. That is the name assistive technology, such as a screen reader, announces for it. The fix uses Playwright's `getByPlaceholder` locator, an expression that finds an input by its placeholder.

## The fix

```ts
page.getByPlaceholder('City or postcode', { exact: true })
```

1. Find the input with the exact placeholder `City or postcode`.

   **Why:** In `order-lookup-first`, the first field is for order numbers, but the pickup field keeps its placeholder. In `pickup-and-return-tools`, the pickup field gains a wrapper. Its accessible name also changes from `Location` to `Pickup location`. The placeholder stays the same. The whole-value match rejects `City or postcode for returns`, even when that field comes first.

The placeholder tells the customer what kind of search each input is for. The exercise treats its wording as a contract, a promise that the text stays the same. So the placeholder is useful even when these tools share the same input type. If the test goes on to search, use a postcode with known pickup results. Then the test can check the outcome as well as the choice of field.

## Why the tempting answer fails

The decoy takes the first search box with `.nth(0)`. In the original layout, that is the pickup input. In `order-lookup-first`, it would enter a city or postcode into the order field. In `pickup-and-return-tools`, it would enter that data into the returns tool instead. In both cases, the decoy returns a single search box, so a count check would miss either mistake.

## What the interviewer listens for

Explain why the placeholder is a suitable anchor here. An anchor is the stable feature that a locator starts from. Also say when you would prefer a stable label or accessible name. A product might translate its placeholders or add examples to them. In that case, exact matches on that wording have to account for the change in text.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
