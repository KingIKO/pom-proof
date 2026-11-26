---
problem: locator/search-pickup-locations
---

```ts
page.getByPlaceholder('City or postcode', { exact: true })
```

This exercise asks for the pickup input by its placeholder. `City or postcode` survives the layout changes and distinguishes the original location search from the order lookup. Use a whole-value match because the return search can begin with the same words. The locator still describes the pickup input even when its accessible name changes from `Location` to `Pickup location`.

The first search box is the pickup input in the initial page, so `.nth(0)` might seem easy to read. Once order lookup moves first, that locator would enter location data into the order field. In the version with a return search, it would select the return input instead. A one-match count on the decoy would not catch either mistake.

An interviewer may ask whether the placeholder is always your first choice. Explain that you would normally use a stable accessible name or label if available. The placeholder tells the customer the expected input format, and it can change when the product adds examples or translates the page. It is a useful contract here because the exercise explicitly specifies it.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
