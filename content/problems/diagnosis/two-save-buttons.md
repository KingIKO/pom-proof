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
      - { id: stable, text: The main Save button moves while Playwright waits for it to stop moving. }
      - { id: dual, text: "The page-level locator matches both Save buttons, but the click needs exactly one." }
      - { id: wording, text: Neither button has the exact accessible name Save. }
  - id: fix
    type: single-choice
    prompt: How should the test select the shipping Save button?
    choices:
      - { id: first, text: "Use the first matching Save button, and rely on the current DOM order." }
      - { id: scope, text: "Find the Shipping address group by role and name, then find its Save button." }
      - { id: settle, text: "Wait for the desktop layout to stop changing, then use the page-level locator." }
      - { id: retry, text: "If a strict mode error occurs, retry the same click." }
  - id: evidence
    type: multi-select
    prompt: Which checks show that the scoped fix targets the shipping button?
    choices:
      - { id: count, text: The page locator finds both buttons while the scoped locator finds only the one in Shipping address. }
      - { id: desktop, text: "In the screenshot of the desktop layout, the Shipping address group appears before the other group." }
      - { id: visible, text: "On desktop, the Save button selected by the test is visible in the browser viewport." }
      - { id: outgoing, text: "In a layout with the groups swapped, the scoped click still submits the shipping update." }
reference:
  cause: dual
  fix: scope
  evidence: [count, outgoing]
decoy:
  cause: dual
  fix: first
  evidence: [desktop, visible]
---

On desktop, the settings page puts the Shipping address and Billing address groups side by side. Each group has a visible button named `Save`. On mobile, the inactive group is hidden. The test edits the shipping address.

A locator is Playwright's description of how to find elements. A scoped locator searches only inside another element. In strict mode, an action fails when its locator matches more than one element. The viewport is the visible area of the browser window. The DOM is the browser's tree of page elements.

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
