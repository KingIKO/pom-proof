---
title: Report an inconsistent mobile checkout quote
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
items:
  - id: severity
    type: single-choice
    prompt: Which severity fits the evidence?
    choices:
      - { id: s2, text: "S2, required task blocked with no supported workaround" }
      - { id: s4, text: "S4, formatting only and amounts agree" }
      - { id: s3, text: "S3, incorrect information with no financial effect shown" }
      - { id: s1, text: "S1, capture differs from the confirmed amount or permanent loss" }
  - id: priority
    type: single-choice
    prompt: Which fix priority fits the campaign policy?
    choices:
      - { id: p2, text: "P2, next maintenance window" }
      - { id: p1, text: "P1, before the discount campaign begins" }
      - { id: p0, text: "P0, stop all checkout rollout" }
  - id: component
    type: single-choice
    prompt: Which component is the best starting point given the matching API and captured amounts?
    choices:
      - { id: gateway, text: "Payment provider capture" }
      - { id: inventory, text: "Inventory reservation" }
      - { id: discounts, text: "Promotion eligibility service" }
      - { id: summary, text: "Mobile checkout summary" }
  - id: title
    type: single-choice
    prompt: Which title identifies the mismatch without asserting a cause?
    choices:
      - { id: long, text: "Checkout total on Pixel staging build 702 with tax and the sample item discount shows 12.39 when the API and charge are 12.40" }
      - { id: vague, text: "Issue with discounted checkout" }
      - { id: precise, text: "Mobile discount summary shows a cent less than sandbox quote" }
      - { id: blame, text: "Checkout developer rounded the discount wrong" }
  - id: steps
    type: ordering
    prompt: Order the checkpoints from prepared cart to receipt.
    choices:
      - { id: capture, text: "Complete the sandbox order and record the captured amount." }
      - { id: apply, text: "Apply the active test discount in mobile checkout." }
      - { id: compare, text: "Record the displayed total and the confirmed quote before payment." }
      - { id: seed, text: "Load the tax-and-discount cart fixture in the test account." }
  - id: missing
    type: multi-select
    prompt: Which missing evidence would help isolate this discount case before filing?
    choices:
      - { id: reference, text: "Sandbox order and quote identifiers" }
      - { id: charge, text: "Captured payment amount" }
      - { id: fixture, text: "Fixture cart details, including quantities and discount rule" }
      - { id: build, text: "Build number" }
  - id: expected
    type: single-choice
    prompt: Which comparison reflects the supported defect?
    choices:
      - { id: eligibility, text: "Expected the active promo to apply; actual the code is rejected at checkout." }
      - { id: amounts, text: "Expected the summary to show the confirmed 12.40 quote; actual it shows 12.39 while the capture is 12.40." }
      - { id: refund, text: "Expected the extra cent to be refunded; actual the order shows Refund pending." }
      - { id: capture, text: "Expected the provider to capture 12.40; actual the provider captured 12.39." }
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

> The total under the promo on my phone is 12.39, but the review-and-pay confirmation says 12.40.

Staging build 702, Pixel 8, Chrome 137, USD tax-and-discount fixture. Screenshot: summary `12.39`; review-and-pay confirmation `12.40`. Sandbox log lists quote `1240` and captured `1240` in cents. The purchase succeeded. The requirement is for the summary to match the confirmed quote.

Severity: S1 incorrect capture relative to the confirmed amount or permanent loss; S2 required task blocked with no supported workaround; S3 incorrect information with no financial effect shown; S4 formatting only and amounts agree. Priority: P0 stop all checkout rollout for wrong captures or blocked purchases; P1 fix before the affected discount campaign begins for inaccurate totals; P2 fix minor cosmetic issues at maintenance. The campaign is scheduled next week.
