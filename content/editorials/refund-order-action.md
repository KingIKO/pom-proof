---
problem: locator/refund-order-action
---

## What is going on

The order page has two refund buttons with the same visible text. Both say `Refund`, but each accessible name includes its own order number. The exercise asks for the action for `PP104`. Because a refund applies to a particular order, a single matching button is only useful if it belongs to that order.

## The fix

```ts
page.getByRole('button', { name: 'Refund order PP104', exact: true })
```

1. Find the button with the exact accessible name `Refund order PP104`.

   **Why:** In `reordered-actions`, the refund action moves before `Print receipt`. In `different-wrapper`, it moves into a `footer`, and the other order moves ahead of it. Neither change affects the button role or the `aria-label` that supplies the order-specific name. The full name points to `PP104` even when both buttons still say `Refund` on screen.

In a Playwright test, assign the locator to `refund` and use `await expect(refund).toHaveCount(1)` to check it resolves to exactly one element before acting. Read that result alongside what the locator actually asks for: a single match can still represent a different action if you identify it by position.

## Why the tempting answer fails

`.actions > button:nth-child(2)` agrees with the original layout. In `reordered-actions`, the second button is `Print receipt`, so the selector still finds an actionable control and the count can pass. In `different-wrapper`, the intended button is under a `footer` instead of `.actions`, so the decoy matches nothing. Waiting for the old location would not make the current markup match it.

## What the interviewer listens for

Explain how the accessible name distinguishes two buttons with identical visible text. In a complete refund test, verify that the status of order `PP104` changed and that the other order was untouched.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright test assertions](https://playwright.dev/docs/test-assertions)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
