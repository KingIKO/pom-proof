---
problem: locator/use-recovery-code-link
---

```ts
page.getByRole('link', { name: 'Use a recovery code', exact: true })
```

The first clue is that the user follows a link. The second is its whole accessible name, `Use a recovery code`. The help link has a longer name and a different purpose. Use `exact: true` to distinguish the two without tying the test to the surrounding navigation, wrapper, or route prefix.

Without `exact`, a string name matches a substring by default. The original screen contains one matching link, so the shortcut looks fine. When help is added, both `How to use a recovery code` and `Use a recovery code` match. The new route layout supplies another longer match, `Use a recovery code on a new device`. Selecting a match by position would just hide the fact that the locator now describes several links.

In an interview, say what you would assert after following the link: the recovery code entry form is ready. A destination assertion complements the locator if route names change. If all link captions are localized, use the expected caption for the locale under test or agree on a stable test ID.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices). See [role name matching](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name) for the default substring behavior.
