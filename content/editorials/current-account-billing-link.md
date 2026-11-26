---
problem: locator/current-account-billing-link
---

```css
nav[data-nav="account-settings"] a[aria-current="page"][href$="/billing"]
```

The outer selector picks account navigation. The link must carry `aria-current="page"` and have an `href` ending in `/billing`. In this app the latter describes the overview, while `/billing/history` identifies a neighboring page. An exact state value matters: `[aria-current]` alone would also match elements marked `aria-current="false"`.

An exact route for personal billing works when that is the account being viewed. It still finds a link after switching to the consulting account, but that link is no longer marked as current. In the localized view the old route disappears altogether. A broader suffix selector without the account navigation scope would also match the current organization or help billing page.

In an interview, identify the limits of the route contract. CSS tests the attribute string; it does not parse a URL into path and query components. A trailing slash or query string after `/billing` would require a different contract. A dedicated link identifier would work if those URL forms were expected.

Sources: [MDN attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors), [MDN aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current), [Playwright locators](https://playwright.dev/docs/locators), and [Playwright best practices](https://playwright.dev/docs/best-practices).
