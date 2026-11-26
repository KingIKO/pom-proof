---
problem: locator/remove-on-call-rotation-address
---

```ts
page.getByTestId('notification-settings')
  .getByRole('group', { name: 'On-call rotation', exact: true })
  .getByRole('listitem')
  .filter({ hasText: 'ops@north.example' })
  .getByRole('button', { name: 'Remove address', exact: true })
```

Start with the editable settings panel, then narrow to the on-call rotation group. Inside that group, the email identifies a list item and the accessible button name tells you which action to take. The `Remove address` name is available whether the button shows a word or only a cross. The caption and wrappers can change without changing the locator.

The decoy works because the rotation entry appears first. If the digest comes first, it would remove the digest address instead. When the sample panel appears, it repeats the rotation name and the email. A locator scoped only by the group name would see both the editable and sample versions. The testing hook gives that distinction a stable name.

In an interview, justify each link in the chain with the ambiguity it resolves. If the application allowed the same address twice within one rotation, the email alone would stop identifying a list item. A record ID or a stated rule for choosing between the entries would be needed.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
