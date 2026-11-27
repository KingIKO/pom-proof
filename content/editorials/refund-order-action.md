---
problem: locator/refund-order-action
---

## What is going on

The order page has two refund buttons with the same visible text. Both say `Refund`. Each button has an accessible name that includes its own order number. The accessible name is what assistive technology, such as a screen reader, announces for a control. The exercise asks for the action for `PP104`.

A refund applies to one particular order. So a single matching button is useful only if it belongs to that order. The fix uses Playwright's `getByRole` locator, an expression that finds page elements. It finds an element by its role, such as button, and by its accessible name.

## The fix

```ts
page.getByRole('button', { name: 'Refund order PP104', exact: true })
```

1. Find the button with the exact accessible name `Refund order PP104`.

   **Why:** In `reordered-actions`, the refund action moves before `Print receipt`. In `different-wrapper`, it moves into a `footer`, and the other order moves ahead of it. Neither change affects the button role or the `aria-label` attribute that supplies the name with the order number. The full name points to `PP104`, even when both buttons still say `Refund` on screen.

In a Playwright test, assign the locator to `refund`. Before acting, use `await expect(refund).toHaveCount(1)` to check that it finds exactly one element. Read that result together with what the locator actually asks for. A locator that picks by position can find a single match that is still a different action.

## Why the tempting answer fails

`.actions > button:nth-child(2)` picks a button that is the second child directly inside `.actions`. It agrees with the original layout. In `reordered-actions`, the second button is `Print receipt`. So the selector still finds a control you can click, and the count check can pass. In `different-wrapper`, the intended button sits under a `footer` instead of `.actions`, so the decoy matches nothing.

Waiting for the old location would not help, because the current markup does not match it.

## What the interviewer listens for

Explain how the accessible name tells apart two buttons with identical visible text. In a complete refund test, check that the status of order `PP104` changed. Also check that the other order was untouched.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright test assertions](https://playwright.dev/docs/test-assertions)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors)
