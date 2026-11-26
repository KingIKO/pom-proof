---
problem: locator/open-live-branch-calendar
---

```ts
page.getByRole('button', { name: 'Open South Quay calendar', exact: true })
```

Role matching uses the button's accessible name and excludes hidden elements by default. `aria-label` keeps the name stable where the visible caption changes to `Calendrier`. The holiday action has a different name. Exact matching expresses that the test expects this named branch calendar rather than a family of calendar links.

The plain CSS attribute selector finds one button in the original fixture. It also matches the copy inside the `hidden` container when the desktop layout is collapsed. The CSS-hidden version has the same problem: the class applies `display: none` to an ancestor, while the button itself still has the exact `aria-label` in the DOM. Adding a check for `hidden` on the button would miss both forms of ancestor hiding.

An interviewer wants to hear how you distinguished an element present in HTML from a control exposed to users. Here the UI uses actual hidden containers. If two visible buttons still shared the same accessible name, you would need a second piece of context, such as the named branch section, to establish one match.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices). See the [role visibility option](https://playwright.dev/docs/api/class-page#page-get-by-role-option-include-hidden) for hidden element handling.
