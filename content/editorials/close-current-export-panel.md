---
problem: locator/close-current-export-panel
---

## What is going on

The export history panel is a native `dialog`, the HTML element built for dialog panels. The app can preload a closed copy of it. That means the app loads the panel early, so it is ready the next time the user opens it. That closed copy may already contain a Close button. So finding a Close button in the markup does not prove it belongs to the panel that is open now.

The fix uses a CSS selector, a pattern that matches elements by tag name and attributes.

## The fix

```css
dialog[open][data-panel="exports"] button[value="close"]
```

1. Select the native dialog with `data-panel="exports"` and an `open` attribute.

   **Why:** An attribute is a named value in an element's HTML tag. In the `closed-copy-preloaded` layout, both copies have the same export identifier. Only the copy that is open now has the `open` attribute, so requiring it leaves out the preloaded copy. In `separate-dialog-layout`, the heading is translated. The panel identifier stays the same.

2. Find the descendant button whose `value` is `close`.

   **Why:** In `separate-dialog-layout`, the caption changes to `Fermer`. The button also gets another wrapper, and a download button comes before it. The `value` attribute still identifies the close command. The descendant combinator is the space between the two parts of the selector. It lets the button sit at any depth inside the open dialog.

The `[open]` check only tests whether the native dialog has the `open` attribute. In this exercise, that attribute is the state contract, the app's promise about which panel is current. Unrelated CSS could still hide an open dialog. A custom dialog built from a `div` would need its own state or accessibility contract.

## Why the tempting answer fails

The tempting answer leaves out `[open]`. That works on the original page, because the closed dialog there is for filters and has a different identifier. In `closed-copy-preloaded` and `separate-dialog-layout`, the shortcut matches two buttons.

Putting the copies in separate containers does not show which copy is current. So changing the descendant combinator would not fix the cause of the two matches.

## What the interviewer listens for

Name the attribute that shows whether the dialog is open. Then name the value that identifies the command inside it. Suppose the app changed how it marks the current panel. Explain what the selector would then need to know.

## Sources

- [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
