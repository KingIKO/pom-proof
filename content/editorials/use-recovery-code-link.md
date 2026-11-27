---
problem: locator/use-recovery-code-link
---

## What is going on

The sign-in screen links to a form for entering a recovery code. It can also link to instructions and to a different recovery flow for a new device. The task is to open the entry form. The links share some wording, so the test needs the full name of the choice the user would follow.

## The fix

```ts
page.getByRole('link', { name: 'Use a recovery code', exact: true })
```

1. Find the link with the exact accessible name `Use a recovery code`.

   **Why:** In `help-link-added`, the entry link's caption moves inside a span, but the full accessible name still distinguishes the link from the help article. In `new-layout-and-route`, the target moves to a new URL under `/auth/recovery`. Its name still identifies the same choice without tying the test to the route prefix or the navigation's layout.

The role asks for an action that takes the user somewhere. The exact name supplies the intent of that action, so longer names that happen to contain the same words stay out of the result.

## Why the tempting answer fails

Without `exact: true`, Playwright matches a string name by substring. That yields one link on the original page, but `help-link-added` adds `How to use a recovery code`, and `new-layout-and-route` adds `Use a recovery code on a new device`. Both variants leave the decoy with two matches. Selecting one by position would hide the ambiguity.

## What the interviewer listens for

After following the link, check that the recovery code entry form is ready so the destination can change URL without losing the intended behavior. If link captions are localized, use the expected caption for the locale under test or agree on a stable test ID.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright role name matching](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name)
