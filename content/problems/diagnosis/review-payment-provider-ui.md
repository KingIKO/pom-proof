---
title: Review a payment handoff test
kind: diagnosis
topic: test-code-review
difficulty: medium
minutes: 6
roles: [automation, sdet, senior]
items:
  - id: review
    type: line-marking
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "import { expect } from '@playwright/test';" }
      - { id: l02, text: "import { test } from './fixtures';" }
      - { id: l03, text: "test('hands an order to hosted checkout', async ({ page, order }) => {" }
      - { id: l04, text: "  await page.goto(`/orders/${order.id}/pay`);" }
      - { id: l05, text: "  const pay = page.getByRole('button', { name: 'Continue to payment' });" }
      - { id: l06, text: "  await expect(pay).toBeEnabled();" }
      - { id: l07, text: "  await pay.click();" }
      - { id: l08, text: "  await expect(page).toHaveURL(order.hostedCheckoutUrl);" }
      - { id: l09, text: "  await page.waitForTimeout(800);" }
      - { id: l10, text: "  const vendorForm = page.getByRole('form', { name: 'PayGate Express' });" }
      - { id: l11, text: "  await expect(vendorForm.getByLabel('Card number')).toBeVisible();" }
      - { id: l12, text: "});" }
  - id: category
    type: single-choice
    prompt: "What is the biggest problem with what this check covers?"
    choices:
      - { id: waits, text: "The fixed delay may be too short for the provider's page to appear." }
      - { id: control, text: "The handoff check depends on the vendor's page content instead of stopping at the redirect the team controls." }
      - { id: action, text: "The test starts the redirect with a Playwright button click." }
      - { id: url, text: "The test checks the exact destination of the redirect." }
reference:
  review: [l09, l10, l11]
  category: control
decoy:
  review: [l09]
  category: waits
---

This check verifies only that the merchant redirects to the session URL it received. That redirect is the handoff from the merchant to the payment provider. The fixture already supplies a known URL on an origin that the provider owns. An origin is a URL's scheme, host and port. The fixture also serves a local stub, a stand-in page, at exactly that URL.

The stub has no vendor form, by design. The provider's UI is outside the merchant team's scope. The test already asserts the exact destination.
