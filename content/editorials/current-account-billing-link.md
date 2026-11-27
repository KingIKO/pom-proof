---
problem: locator/current-account-billing-link
---

## What is going on

Account settings, organization settings, and help can each have a billing link. Each navigation menu can also mark its own page as current. This exercise asks for the current billing overview within account settings, and lets the account and locale change the start of its URL.

## The fix

```css
nav[data-nav="account-settings"] a[aria-current="page"][href$="/billing"]
```

1. Scope to the `nav` with `data-nav="account-settings"`.

   **Why:** In `another-account-and-organization-nav`, the organization link is current and ends in `/billing` too. In `localized-nav-with-grouping`, help supplies the same distraction. The account menu's stable identifier separates the menus even when their labels are translated.

2. Require a descendant link whose `aria-current` equals `page`.

   **Why:** In `another-account-and-organization-nav`, both personal and consulting billing links remain in the account menu. Only consulting is current. A presence check like `[aria-current]` would also admit attributes with the value `false`, as on the security link in `localized-nav-with-grouping`.

3. Require the link's `href` to end in `/billing`.

   **Why:** In `localized-nav-with-grouping`, the prefix changes to `/fr/accounts/consulting`, while the overview keeps its suffix. Matching that suffix leaves out `/billing/history` and lets the markup gain link wrappers without encoding a path through them.

## Why the tempting answer fails

The exact route `/accounts/personal/billing` identifies the original personal link. In `another-account-and-organization-nav`, that link still matches even though consulting is current. In `localized-nav-with-grouping`, the original route is gone and the selector returns nothing. A suffix without the account scope would have the opposite problem: it could match both menus.

## What the interviewer listens for

Explain that CSS compares the attribute string, so a query string or trailing slash after `/billing` would defeat the suffix check. If the app allows those forms, agree on another contract such as a dedicated link identifier.

## Sources

- [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors)
- [MDN aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
