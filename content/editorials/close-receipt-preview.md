---
problem: locator/close-receipt-preview
---

```ts
page.getByRole('button', { name: 'Close receipt preview', exact: true })
```

The preview close button gets its accessible name from `aria-label`. Its cross is decorative. Select the button by that name so the locator still identifies the preview action if the icon changes or a notice happens to use the same symbol.

`.css-x184h` finds the close button in the original markup. In the new build the same button has class `css-s274v`, and the copied CSS selector finds nothing. The footer layout gives a different reason to avoid relying on the original DOM: the preview action moves out of the header, while a notice adds a second cross. Matching the name expresses which part of the screen the tester intends to close.

An interviewer may ask how you discovered the name when the interface only displays a cross. Explain that you would inspect the button's accessible name in browser tools or inspect its `aria-label`. In a test, check that the preview closes. If the requirement says dismissing the preview should leave the download notice intact, verify that separately.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
