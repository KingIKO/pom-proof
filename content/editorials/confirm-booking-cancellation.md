---
problem: locator/confirm-booking-cancellation
---

```ts
page.getByRole('dialog', { name: 'Cancel booking BK-281?', exact: true })
  .getByRole('button', { name: 'Confirm', exact: true })
```

The outer locator names the cancellation dialog for `BK-281`. Its `aria-labelledby` points to the heading that gives the dialog its accessible name. The heading ID can change as long as the reference to it stays valid. The inner locator picks `Confirm` within that dialog, even when the button gains a wrapper or moves ahead of `Go back`.

The first button named `Confirm` is correct with only one prompt. Both revised layouts place a visible notification confirmation above the booking dialog, so the first-button decoy acts on the wrong prompt. One layout also keeps a duplicate dialog in a hidden container. The role locator excludes that hidden dialog by default, even though its accessible name would otherwise match.

Explain to an interviewer that the same caption expresses different actions depending on its dialog. A test that confirms a cancellation should verify that the booking itself changes state. Checking that some dialog disappeared would leave open the possibility that the test confirmed notifications instead.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
