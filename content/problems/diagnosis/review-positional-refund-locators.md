---
title: Review locators in a refund test
kind: diagnosis
topic: test-code-review
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: review
    type: line-marking
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "import { expect } from '@playwright/test';" }
      - { id: l02, text: "import { test } from './fixtures';" }
      - { id: l03, text: "test('refunds the selected order', async ({ page, refundPair }) => {" }
      - { id: l04, text: "  const { target, other } = refundPair;" }
      - { id: l05, text: "  await page.goto('/orders');" }
      - { id: l06, text: "  const row = page.getByRole('row').nth(2);" }
      - { id: l07, text: "  await row.locator('.RefundButton_q7hr4').click();" }
      - { id: l08, text: "  const dialog = page.getByRole('dialog', { name: 'Confirm refund' });" }
      - { id: l09, text: "  await dialog.getByRole('button', { name: 'Confirm refund' }).click();" }
      - { id: l10, text: "  await expect(page.getByTestId(`order-state-${target.id}`)).toHaveText('Refunded');" }
      - { id: l11, text: "  await expect(page.getByTestId(`order-state-${other.id}`)).toHaveText('Paid');" }
      - { id: l12, text: "});" }
  - id: category
    type: single-choice
    prompt: "What is the most serious problem in this change?"
    choices:
      - { id: assertion, text: "The test checks too many order states after the click." }
      - { id: data, text: "The fixture creates two records where the test needs one." }
      - { id: locator, text: "The test chooses the order by position and the action by a generated CSS class." }
      - { id: race, text: "The test clicks the dialog before Playwright can find it." }
reference:
  review: [l06, l07]
  category: locator
decoy:
  review: [l07]
  category: locator
---

The `refundPair` fixture creates two paid orders with distinct IDs. The PR must refund `target` and leave `other` paid. The table can reorder the rows, the action has the accessible name `Request refund`, and the build generates its CSS class.
