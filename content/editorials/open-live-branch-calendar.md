---
problem: locator/open-live-branch-calendar
---

## What is going on

The South Quay branch can keep two layouts in the DOM at once. Only the active layout exposes its calendar button to users. The inactive copy has the same label, and there is also a separate holiday calendar action. The test needs the branch appointment calendar the customer can actually open.

## The fix

```ts
page.getByRole('button', { name: 'Open South Quay calendar', exact: true })
```

1. Find the button with the exact accessible name `Open South Quay calendar`.

   **Why:** In `collapsed-desktop-copy`, role matching excludes the button inside the `hidden` container by default. In `compact-layout-hidden-copy`, it also excludes the copy whose ancestor has `display: none`. The active button's `aria-label` keeps its name stable even though the visible caption becomes `Calendrier`. The holiday action has its own accessible name, so the exact match stays on the calendar requested.

This is a case where the role lookup does two useful jobs. It matches the identity the app exposes to users of assistive technology and keeps hidden copies out of the result before the test tries to use the control.

## Why the tempting answer fails

The plain CSS selector for a button with that `aria-label` finds one match originally. It finds two in `collapsed-desktop-copy` and `compact-layout-hidden-copy` because both copies are still in the markup. Checking for a `hidden` attribute on the button itself would miss both cases of ancestor hiding: one ancestor has the attribute and the other is hidden by a CSS class.

## What the interviewer listens for

Explain why an element found in HTML can be absent from the controls a user can choose. If two exposed buttons really shared this accessible name, add a second piece of context, such as a named branch section, to establish a single match.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright role visibility option](https://playwright.dev/docs/api/class-page#page-get-by-role-option-include-hidden)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
