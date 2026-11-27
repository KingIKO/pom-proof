---
problem: locator/close-receipt-preview
---

## What is going on

The receipt preview has a close button that shows only a cross, and the cross is decoration. Another control can show the same cross to dismiss a download notice. The preview button has an `aria-label` attribute that gives it its own accessible name. An accessible name is the name the browser reports to assistive tools such as screen readers. That name says what will close when the user activates the button.

## The fix

```ts
page.getByRole('button', { name: 'Close receipt preview', exact: true })
```

1. Find the button whose accessible name is exactly `Close receipt preview`.

   **Why:** In the `footer-with-dismiss-action` layout, both the notice and the preview have a cross. The preview's button moves from the header into a footer. Its accessible name still tells it apart from `Dismiss download notice`. In `new-icon-build`, the generated class name changes, but the accessible name stays the same. The test follows what the control means, so a design update can change the icon without changing which button the test finds.

If the screen shows only a cross, look up the button's accessible name. You can find it in the browser's accessibility tools or in the button's `aria-label` in the markup. A role locator finds an element by its role, such as button, and by its accessible name. That is the name it can use.

## Why the tempting answer fails

The tempting answer copies the CSS class selector `.css-x184h` from the browser's inspector. That selector matches elements by their class name. It finds one match in the original markup. In `new-icon-build`, the close button has the class `css-s274v` instead. So the shortcut finds nothing, even though the button is still there.

The old class does come back in `footer-with-dismiss-action`. That layout breaks other shortcuts. A search in the old header misses the moved button. A search for the cross alone finds two buttons.

## What the interviewer listens for

Explain how you found the accessible name of a button with no visible caption. After the click, check that the receipt preview closes. If the download notice should stay open, check that separately.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
