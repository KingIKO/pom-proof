---
problem: locator/open-live-branch-calendar
---

## What is going on

The South Quay branch page can keep two layouts in the DOM at once. The DOM is the browser's live model of the page's elements. Only the active layout shows its calendar button to users. The inactive copy has the same label.

There is also a separate holiday calendar action. The test needs the branch appointment calendar that the customer can actually open.

The fix uses Playwright's `getByRole` locator, an expression that finds page elements. It finds an element by its role, such as button, and by its accessible name. The accessible name is what assistive technology, such as a screen reader, announces for the control. Here, each button's `aria-label` attribute sets that name.

## The fix

```ts
page.getByRole('button', { name: 'Open South Quay calendar', exact: true })
```

1. Find the button with the exact accessible name `Open South Quay calendar`.

   **Why:** In `collapsed-desktop-copy`, role matching leaves out the button inside the `hidden` container by default. In `compact-layout-hidden-copy`, it also leaves out the copy inside a container with `display: none`. That CSS rule hides an element and everything inside it. The active button's `aria-label` keeps its name stable, even though its visible caption becomes `Calendrier`. The holiday action has its own accessible name, so the exact match stays on the requested calendar.

Here the role lookup does two useful jobs. It matches the identity that the app gives to users of assistive technology. It also keeps hidden copies out of the result before the test tries to use the control.

## Why the tempting answer fails

The decoy is a plain CSS selector for a button with that `aria-label`. It finds one match on the original page. It finds two in `collapsed-desktop-copy` and `compact-layout-hidden-copy`, because both copies are still in the markup.

You could add a check for a `hidden` attribute on the button itself. That check would miss both cases, because an ancestor hides each copy. An ancestor is any element that contains another one. One ancestor has the `hidden` attribute. The other is hidden by a CSS class.

## What the interviewer listens for

Explain why an element can be in the HTML but missing from the controls a user can choose. Two buttons that users can reach might really share this accessible name. In that case, add a second piece of context to get a single match. A named branch section is one example.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright role visibility option](https://playwright.dev/docs/api/class-page#page-get-by-role-option-include-hidden)
- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
