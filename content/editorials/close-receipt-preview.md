---
problem: locator/close-receipt-preview
---

## What is going on

The receipt preview has a close button that shows a cross. A different control can show the same icon to dismiss a download notice. The preview button has an `aria-label` that gives it a distinct accessible name, and its cross is decorative. That name explains what will close when the user activates it.

## The fix

```ts
page.getByRole('button', { name: 'Close receipt preview', exact: true })
```

1. Find the button whose accessible name is exactly `Close receipt preview`.

   **Why:** In `footer-with-dismiss-action`, both the notice and the preview have a cross. The preview action moves from the header into a footer, but its accessible name still distinguishes it from `Dismiss download notice`. In `new-icon-build`, the same name survives a generated class change. The test follows the meaning of the control, so a design update can change its icon without changing which action the test finds.

If the screen only shows a cross, inspect the button's accessible name in the browser's accessibility tools or read its `aria-label` in the markup. That tells you which name a role locator can use.

## Why the tempting answer fails

Copying `.css-x184h` from the inspector gives one match in the original markup. In `new-icon-build`, the close button has class `css-s274v`, so the shortcut finds nothing despite the action remaining available. The class does happen to return in `footer-with-dismiss-action`. That layout exposes different shortcuts: searching the old header misses the moved button, and searching for the cross alone leaves two candidates.

## What the interviewer listens for

Explain how you discovered the accessible name on a button with no visible caption. After the action, check that the receipt preview closes. If the download notice is supposed to stay open, verify that separately.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
