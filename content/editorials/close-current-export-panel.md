---
problem: locator/close-current-export-panel
---

```css
dialog[open][data-panel="exports"] button[value="close"]
```

Use the dialog's `open` state as part of the match. The selector picks an open native dialog with the app's export panel identifier. From there it finds the close button by its value. The name of the panel and the caption of the close button can be translated because neither is used in the selector.

The decoy omits `[open]`. It passes on the original layout because the closed dialog belongs to filters and has a different identifier. It matches two buttons as soon as a closed copy of the export history is preloaded. The copies remain present even when the new layout gives them separate containers, so changing the descendant combinator would not identify the current panel.

An interviewer is listening for the specific state you relied on. `[open]` tests the presence of the native dialog attribute, which is the state contract in this exercise. It is not a general CSS test for visibility and cannot account for unrelated styles hiding an open dialog. A custom dialog built with a `div` would need a different state or accessibility contract.

Sources: [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
