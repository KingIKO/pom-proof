---
problem: diagnosis/two-save-buttons
---

The locator finds both Save buttons in the desktop layout. Exact matching helps when one name is `Save` and another is `Save draft`; it cannot distinguish two elements with the same accessible name. A Playwright click needs a single target, so it fails instead of choosing a panel on the test's behalf.

Use the existing `shipping` locator and call `shipping.getByRole('button', { name: 'Save', exact: true }).click()`. The group supplies the context a customer uses to tell those buttons apart. Keep the scoped saved status assertion and use the trace to verify which update is sent.

Calling `first()` can pass on today's layout. It silently selects billing if a redesign moves that group ahead of shipping. A sleep or a retry does not make two intentional targets become one.

In an interview, check the count within the group and explain why count alone is insufficient. A layout with the groups swapped can prove that the test still clicks the shipping action and checks its result.

[Playwright: strictness](https://playwright.dev/docs/locators#strictness) · [Playwright: chaining locators](https://playwright.dev/docs/best-practices#use-chaining-and-filtering)
