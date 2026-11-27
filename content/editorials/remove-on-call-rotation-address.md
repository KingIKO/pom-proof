---
problem: locator/remove-on-call-rotation-address
---

## What is going on

The address `ops@north.example` receives the weekly digest and belongs to the on-call rotation. A sample panel can repeat the entire rotation. Removing the intended entry requires identifying the editable settings, the correct list, and the right entry within it before choosing the action.

## The fix

```ts
page.getByTestId('notification-settings')
  .getByRole('group', { name: 'On-call rotation', exact: true })
  .getByRole('listitem')
  .filter({ hasText: 'ops@north.example' })
  .getByRole('button', { name: 'Remove address', exact: true })
```

1. Start in the panel with the test ID `notification-settings`.

   **Why:** In `editable-settings-and-sample-panel`, the sample repeats both the rotation name and the address. Only the editable panel carries the app's test hook, so the duplicate cannot enter the search.

2. Find the group named exactly `On-call rotation`.

   **Why:** In `digest-first-and-rotation-reordered`, the digest comes first and contains the same address. The group name separates the two uses of that address within the live panel.

3. Scope the address search to list items inside the rotation.

   **Why:** In `digest-first-and-rotation-reordered`, each list item still owns one address and its actions, even though the rotation entries switch places.

4. Keep the list item containing `ops@north.example`.

   **Why:** In `digest-first-and-rotation-reordered`, `backup@north.example` moves ahead of the target and has the same remove action. Matching the address keeps the backup entry out of the result.

5. Find the exact `Remove address` button inside that item.

   **Why:** In `editable-settings-and-sample-panel`, the row gains a wrapper and includes an edit button. The accessible name still identifies Remove when the button shows only a cross, just as it does when the button has a word caption.

## Why the tempting answer fails

Taking the first `Remove address` for that email works when the rotation entry appears first. In `digest-first-and-rotation-reordered`, it would remove the digest subscription. In `editable-settings-and-sample-panel`, it finds the sample entry. A correct address can still lead to the wrong list or panel.

## What the interviewer listens for

Name the ambiguity each part of the chain removes. If one rotation could list the same address twice, use a record ID or an explicit rule for choosing the entry.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
