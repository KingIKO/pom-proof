---
problem: locator/remove-on-call-rotation-address
---

## What is going on

The address `ops@north.example` receives the weekly digest. It also belongs to the on-call rotation. A sample panel can repeat the entire rotation.

To remove the intended entry, the test must first find three things. They are the editable settings, the right list, and the right entry in that list. Only then can it choose the action. The fix chains Playwright locators, expressions that find page elements. Each step searches only inside the result of the step before it.

## The fix

```ts
page.getByTestId('notification-settings')
  .getByRole('group', { name: 'On-call rotation', exact: true })
  .getByRole('listitem')
  .filter({ hasText: 'ops@north.example' })
  .getByRole('button', { name: 'Remove address', exact: true })
```

1. Start in the panel with the test ID `notification-settings`.

   **Why:** A test ID is a `data-testid` attribute that the app adds so tests can find an element. In `editable-settings-and-sample-panel`, the sample repeats both the rotation name and the address. Only the editable panel carries the app's test ID. So the duplicate in the sample cannot enter the search.

2. Find the group named exactly `On-call rotation`.

   **Why:** Here a group is a `fieldset`, and its `legend` gives the group its name. In `digest-first-and-rotation-reordered`, the digest comes first and contains the same address. The group name tells the two uses of that address apart within the live panel.

3. Narrow the address search to list items inside the rotation.

   **Why:** In `digest-first-and-rotation-reordered`, the rotation entries switch places. Each list item still holds one address and its actions.

4. Keep the list item that contains `ops@north.example`.

   **Why:** The `filter` call with `hasText` keeps only the items whose text includes that address. In `digest-first-and-rotation-reordered`, `backup@north.example` moves ahead of the target and has the same remove action. Matching the address keeps the backup entry out of the result.

5. Find the exact `Remove address` button inside that item.

   **Why:** In `editable-settings-and-sample-panel`, the row gains a wrapper and an edit button. The button's accessible name is what assistive technology, such as a screen reader, announces for it. That name still identifies Remove when the button shows only a cross. It does the same when the button has a word caption.

## Why the tempting answer fails

The decoy takes the first `Remove address` button for that email. That works when the rotation entry appears first. In `digest-first-and-rotation-reordered`, it would remove the digest subscription. In `editable-settings-and-sample-panel`, it finds the sample entry. The address can be right while the list or the panel is wrong.

## What the interviewer listens for

Name the ambiguity that each part of the chain removes. Ambiguity here means that more than one element could match. If one rotation could list the same address twice, use a record ID to pick the entry. Or state an explicit rule for choosing it.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
