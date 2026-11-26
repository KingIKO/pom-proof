---
title: Test checkout discount totals
kind: scenario
topic: checkout
difficulty: easy
minutes: 7
roles: [manual-qa, automation]
items:
  - id: clarify
    type: multi-select
    prompt: What do you need to know before choosing carts for the new calculation?
    choices:
      - { id: placement, text: Where should the savings badge appear after applying a code? }
      - { id: threshold, text: "Which items count toward the minimum, and is the exact minimum eligible?" }
      - { id: rounding, text: "How do item and order discounts combine, and where is rounding applied?" }
      - { id: examples, text: Which example code should appear in the customer help article? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to ten minutes on eligibility and matching money across checkout.
    budget: 10
    choices:
      - { id: boundary, cost: 4, text: Compare carts one cent below and exactly at the eligible subtotal. }
      - { id: invalid, cost: 4, text: Compare the messages for expired and mistyped codes. }
      - { id: payment, cost: 6, text: "Compare quoted, authorized, and stored amounts for a rounding-sensitive eligible cart." }
      - { id: screenshot, cost: 3, text: Compare the applied-code layout on phone and desktop. }
  - id: layer
    type: single-choice
    prompt: Which layer first covers the pure discount calculator's eligibility and rounding table?
    choices:
      - { id: unit, text: Unit }
      - { id: ui, text: UI }
      - { id: api, text: API }
      - { id: manual, text: Manual exploratory }
  - id: payment-layer
    type: single-choice
    prompt: Which layer first compares the service quote, sandbox authorization, and saved order amounts?
    choices:
      - { id: ui, text: "UI" }
      - { id: manual, text: "Manual exploratory" }
      - { id: api, text: "API" }
      - { id: unit, text: "Unit" }
  - id: stop
    type: single-choice
    prompt: Which finding stops rollout?
    choices:
      - { id: label, text: A savings caption uses sentence case instead of the proposed wording. }
      - { id: order, text: The order page shows a correct total with the promo line above shipping. }
      - { id: delay, text: A valid promo code takes half a second to update totals. }
      - { id: charge, text: Payment authorizes an amount higher than the confirmed checkout total. }
  - id: order
    type: ordering
    prompt: Order the checkpoints for tracing a discounted charge.
    choices:
      - { id: payment, text: Submit the quoted cart and capture the sandbox authorization amount. }
      - { id: stored, text: Read the stored order after confirmation and reconcile all amounts. }
      - { id: quote, text: Apply the code and record the final quoted total. }
      - { id: cart, text: Create a cart with known eligible and excluded lines. }
reference:
  clarify: [threshold, rounding]
  risk: [boundary, payment]
  layer: unit
  payment-layer: api
  stop: charge
  order: [cart, quote, payment, stored]
decoy:
  clarify: [threshold, placement]
  risk: [boundary, invalid]
  layer: ui
  payment-layer: ui
  stop: charge
  order: [cart, quote, payment, stored]
---

A grocer adds an order discount when eligible items meet a minimum subtotal. Some items already have their own discounts. The ticket leaves threshold details, combination rules, and rounding to be confirmed with product.

Once the shopper confirms the quoted total, the sandbox payment authorization and saved order must match it. The pure price calculator can be called without a browser. A sandbox payment account and seeded carts are ready for the timed checks.
