---
problem: locator/use-recovery-code-link
---

## What is going on

The sign-in screen links to a form where the user enters a recovery code. It can also link to instructions and to a different recovery flow for a new device. The task is to open the entry form. The links share some wording. So the test needs the full name of the choice the user would follow.

The fix uses Playwright's `getByRole` locator, an expression that finds page elements. It finds an element by its role, such as link, and by its accessible name. The accessible name is what assistive technology, such as a screen reader, announces for the element.

## The fix

```ts
page.getByRole('link', { name: 'Use a recovery code', exact: true })
```

1. Find the link with the exact accessible name `Use a recovery code`.

   **Why:** In `help-link-added`, the entry link's caption moves inside a span. The full accessible name still tells the link apart from the help article. In `new-layout-and-route`, the target moves to a new URL under `/auth/recovery`. The name still identifies the same choice. The test does not depend on the route prefix, the start of the URL path, or on the layout of the navigation.

The link role asks for an element that takes the user somewhere. The exact name states what that link is for. So longer names that happen to contain the same words stay out of the result.

## Why the tempting answer fails

Without `exact: true`, Playwright matches a string name as a substring, meaning any part of the name. That finds one link on the original page. `help-link-added` adds `How to use a recovery code`. `new-layout-and-route` adds `Use a recovery code on a new device`. In both variants, the decoy finds two matches.

Picking one of them by position would hide the ambiguity, the fact that more than one link matches.

## What the interviewer listens for

After following the link, check that the recovery code entry form is ready. With that check, the destination can change its URL and the test still confirms the intended behavior.

Link captions might be localized, meaning translated for each locale. A locale is a language and region setting. In that case, use the expected caption for the locale under test. Or agree on a stable test ID, an attribute the app adds so tests can find the element.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright role name matching](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name)
