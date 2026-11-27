---
problem: locator/close-current-export-panel
---

## What is going on

The export history panel uses a native `dialog`. The app can preload a closed copy so it is ready the next time the user opens it. That copy may already contain a Close button, so seeing the button in the markup does not establish that it belongs to the current panel.

## The fix

```css
dialog[open][data-panel="exports"] button[value="close"]
```

1. Select the native dialog with `data-panel="exports"` and an `open` attribute.

   **Why:** In `closed-copy-preloaded`, both copies share the export identifier. The `open` attribute belongs only to the current copy, so requiring it excludes the preloaded panel. In `separate-dialog-layout`, the heading is translated; the panel identifier stays the same.

2. Find the descendant button whose `value` is `close`.

   **Why:** In `separate-dialog-layout`, the caption becomes `Fermer`, the control acquires another wrapper, and a download button sits before it. The value still identifies the close command. The descendant combinator lets the button sit at any depth inside the open dialog.

The `[open]` check tests for the presence of the native dialog attribute. Its scope is the state contract in this exercise. Unrelated CSS could hide an open dialog, and a custom dialog made from a `div` would need its own state or accessibility contract.

## Why the tempting answer fails

Omitting `[open]` works on the original page because its closed dialog is for filters and has a different identifier. In `closed-copy-preloaded` and `separate-dialog-layout`, the shortcut matches two buttons. Putting the copies in separate containers does not resolve which copy is current, so changing the descendant combinator would miss the cause of the ambiguity.

## What the interviewer listens for

Name the attribute that gives you the dialog's open state and the value that identifies the command inside it. Explain what the selector would need to know if the app changed how it represents the current panel.

## Sources

- [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
