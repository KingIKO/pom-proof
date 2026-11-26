---
title: Two settings panels have a Save button
kind: diagnosis
topic: playwright
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Why does the click fail on desktop?
    choices:
      - { id: preflight, text: The browser blocks the shipping save request. }
      - { id: stable, text: The main Save button moves while Playwright waits for its position to stabilize. }
      - { id: dual, text: The page-level locator matches both Save buttons and the click needs one target. }
      - { id: wording, text: Neither button has the exact accessible name Save. }
  - id: fix
    type: single-choice
    prompt: How should the test select the shipping action?
    choices:
      - { id: first, text: Use the first matching Save button and rely on the current DOM order. }
      - { id: scope, text: "Find the Shipping address group by role and name, then find its Save button." }
      - { id: settle, text: Wait for the desktop layout to settle before using the page-level locator. }
      - { id: retry, text: Retry the same click on a strictness error. }
  - id: evidence
    type: multi-select
    prompt: Which checks establish that the scoped fix targets shipping?
    choices:
      - { id: count, text: The unscoped locator reaches both buttons and the scoped locator reaches one inside Shipping address. }
      - { id: desktop, text: The desktop screenshot shows the Shipping address group first. }
      - { id: visible, text: The selected Save button is visible in the desktop viewport. }
      - { id: outgoing, text: "After swapping the two groups in a layout variant, the scoped click still submits the shipping update." }
reference:
  cause: dual
  fix: scope
  evidence: [count, outgoing]
decoy:
  cause: dual
  fix: first
  evidence: [desktop, visible]
---

On desktop, the settings page puts the Shipping address and Billing address groups side by side. Each has a visible button named `Save`. On mobile, the inactive group is hidden. The test edits shipping.

```ts
await page.goto('/settings/addresses');
const shipping = page.getByRole('group', { name: 'Shipping address' });
await shipping.getByLabel('Street').fill('14 River Lane');
await page.getByRole('button', { name: 'Save', exact: true }).click();
await expect(shipping.getByRole('status')).toHaveText('Address saved');
```

```text
desktop: locator.click: strict mode violation
  getByRole('button', { name: 'Save', exact: true }) resolved to 2 elements:
  1) button "Save" in group "Shipping address"
  2) button "Save" in group "Billing address"
mobile: PASS
```
