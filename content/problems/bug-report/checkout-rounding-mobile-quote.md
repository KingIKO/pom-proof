---
title: Report different totals in mobile checkout
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the bug based on what you know?
    choices:
      - { id: s2, text: "S2: A required task has no supported way forward." }
      - { id: s4, text: "S4: The amounts match and only the formatting is wrong." }
      - { id: s3, text: "S3: The information is wrong with no financial effect shown." }
      - { id: s1, text: "S1: The charge differs from the quote or the loss is permanent." }
  - id: priority
    type: single-choice
    prompt: When does the campaign policy say to fix this?
    choices:
      - { id: p2, text: "P2: Fix during the next maintenance window." }
      - { id: p1, text: "P1: Fix before the discount campaign starts." }
      - { id: p0, text: "P0: Stop rolling out checkout everywhere." }
  - id: component
    type: single-choice
    prompt: The checkout service and the charge agree. Where should you look first?
    choices:
      - { id: gateway, text: "The service that collects payment" }
      - { id: inventory, text: "The service that holds stock" }
      - { id: discounts, text: "The service that checks promo rules" }
      - { id: summary, text: "The summary screen in mobile checkout" }
  - id: title
    type: single-choice
    prompt: Which title names the mismatch without guessing why it happened?
    choices:
      - { id: long, text: "On Pixel staging build 702 with tax and the sample item discount, checkout shows 12.39. The API and charge show 12.40." }
      - { id: vague, text: "Something looks wrong in checkout after applying the discount" }
      - { id: precise, text: "Mobile checkout summary shows one cent less than the sandbox quote" }
      - { id: blame, text: "The checkout developer rounded the discount total the wrong way" }
  - id: steps
    type: ordering
    prompt: Put the checks in order from setting up the cart to getting the receipt.
    choices:
      - { id: capture, text: "Finish the test order and note the amount charged." }
      - { id: apply, text: "In mobile checkout, apply the active discount for this test." }
      - { id: compare, text: "Before paying, note the summary total and the confirmed quote." }
      - { id: seed, text: "In the test account, load the cart with tax and a discount." }
  - id: missing
    type: multi-select
    prompt: Which missing details would help someone check this exact discount case?
    choices:
      - { id: reference, text: "The IDs of the test order and quote" }
      - { id: charge, text: "The amount the payment service collected" }
      - { id: fixture, text: "The test cart quantities and discount rule" }
      - { id: build, text: "The build number of the app tested" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results match the evidence?
    choices:
      - { id: eligibility, text: "The active promo should apply at checkout. Instead, checkout rejects the promo code." }
      - { id: amounts, text: "The summary should show the confirmed quote of 12.40. Instead, it shows 12.39, and the charge is 12.40." }
      - { id: refund, text: "The customer should get the extra cent back. Instead, the order shows Refund pending." }
      - { id: capture, text: "The payment provider should collect 12.40 for the order. Instead, it collects 12.39." }
reference:
  severity: s3
  priority: p1
  component: summary
  title: precise
  steps: [seed, apply, compare, capture]
  missing: [reference, fixture]
  expected: amounts
decoy:
  severity: s1
  priority: p0
  component: gateway
  title: long
  steps: [seed, apply, compare, capture]
  missing: [reference, charge]
  expected: amounts
---

> On my phone, the total under the promo is 12.39. The review-and-pay confirmation says 12.40.

The test used staging build 702, a test release, on a Pixel 8 with Chrome 137. The fixture is a prepared cart with tax and a discount in US dollars (USD). The screenshot shows `12.39` in the summary and `12.40` at review and pay.

The sandbox is the test payment system. The API is the interface checkout uses to request a quote from the service. The sandbox log shows a confirmed quote of `1240` cents and a capture, or collected payment, of `1240` cents. The purchase succeeded. The summary must match the confirmed quote.

Severity tells how serious the bug is:

- S1: The charge differs from the confirmed amount or the loss is permanent.
- S2: A required task is blocked and has no supported workaround.
- S3: The information is wrong and nothing shows a financial effect.
- S4: Only the formatting is wrong. The amounts agree.

Priority tells when to fix it:

- P0: If charges are wrong or purchases are blocked, stop rolling out checkout everywhere.
- P1: If totals are wrong, fix them before the affected discount campaign starts.
- P2: If a minor issue only affects appearance, fix it during maintenance.

The campaign is scheduled for next week.
