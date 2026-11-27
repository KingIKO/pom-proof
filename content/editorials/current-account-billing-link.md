---
problem: locator/current-account-billing-link
---

## What is going on

Account settings, organization settings, and help can each have a billing link. Each navigation menu can also mark its own page as current. The test needs the current billing overview link in account settings. The account and the locale, meaning the language and region, can change the start of that link's URL.

The fix uses a CSS selector, a pattern that matches elements by tag name and attributes. An attribute is a named value in an element's HTML tag.

## The fix

```css
nav[data-nav="account-settings"] a[aria-current="page"][href$="/billing"]
```

1. Limit the search to the `nav` with `data-nav="account-settings"`.

   **Why:** In the `another-account-and-organization-nav` layout, the organization menu's link is current and also ends in `/billing`. In `localized-nav-with-grouping`, the help menu has a current link ending in `/billing` too. The account menu's identifier stays the same. So it tells the menus apart even when their labels are translated.

2. Require a descendant link, one anywhere inside that menu, whose `aria-current` equals `page`.

   **Why:** The `aria-current` attribute marks the link for the page the user is on. In `another-account-and-organization-nav`, the account menu still has billing links for both the personal and consulting accounts. Only the consulting link is current. A presence check like `[aria-current]` only asks whether the attribute exists, so it would also match the value `false`. The security link in `localized-nav-with-grouping` has that value.

3. Require the link's `href` to end in `/billing`.

   **Why:** The `href` attribute holds the link's URL, and `$=` matches its ending. In `localized-nav-with-grouping`, the start of the URL changes to `/fr/accounts/consulting`. The overview link still ends in `/billing`. Matching that ending leaves out `/billing/history`. It also lets the markup add wrappers around links, because the selector does not spell out a path through them.

## Why the tempting answer fails

The tempting answer matches the exact route `/accounts/personal/billing`. That finds the personal link on the original page. In `another-account-and-organization-nav`, that link still matches even though the consulting link is current. In `localized-nav-with-grouping`, the original route is gone, so the selector returns nothing. A suffix check without the account menu scope has the opposite problem, because it could match both menus.

## What the interviewer listens for

A query string is the part of a URL that starts with `?`. Explain that CSS compares the attribute as plain text. So a query string or a trailing slash after `/billing` would defeat the suffix check. If the app allows those forms, agree on another contract, a value the app promises to keep stable. One example is a dedicated link identifier.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
