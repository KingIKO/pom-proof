---
title: Check totals when checkout applies a discount
kind: scenario
topic: checkout
difficulty: easy
minutes: 7
roles: [manual-qa, automation]
items:
  - id: clarify
    type: multi-select
    prompt: What do you need to know before you choose carts to test the new calculation?
    choices:
      - { id: placement, text: "After a shopper applies a code, where should the savings badge appear?" }
      - { id: threshold, text: "Which items count toward the minimum, and does a cart at exactly the minimum qualify?" }
      - { id: rounding, text: "How do item and order discounts combine, and at which step is rounding applied?" }
      - { id: examples, text: "Which sample code should the help article for customers show?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 10 minutes. Choose checks for who qualifies and for amounts that match across checkout.
    budget: 10
    choices:
      - { id: boundary, cost: 4, text: "Compare a cart one cent below the qualifying subtotal with a cart exactly at it." }
      - { id: invalid, cost: 4, text: "Compare the messages for a code that has expired and a code that is mistyped." }
      - { id: payment, cost: 6, text: "For a qualifying cart where rounding matters, compare the quoted, authorized, and stored amounts." }
      - { id: screenshot, cost: 3, text: "Compare how an applied code looks on a phone and on a desktop." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first covers the pure discount calculator's table of qualifying and rounding cases?
    choices:
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: payment-layer
    type: single-choice
    prompt: Which kind of test first compares the service's quote, the sandbox payment authorization, and the saved order amounts?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
      - { id: unit, text: "A unit test" }
  - id: stop
    type: single-choice
    prompt: Which finding should stop the rollout?
    choices:
      - { id: label, text: "A savings caption uses sentence case instead of the proposed wording." }
      - { id: order, text: "The order page shows a correct total with the promo line above shipping." }
      - { id: delay, text: "A valid promo code takes half a second to update the totals." }
      - { id: charge, text: "The payment authorizes more money than the confirmed checkout total." }
  - id: order
    type: ordering
    prompt: Put the checkpoints in order to trace a discounted charge.
    choices:
      - { id: payment, text: "Submit the quoted cart and record the amount the sandbox authorizes." }
      - { id: stored, text: "After confirmation, read the stored order and check that all amounts match." }
      - { id: quote, text: "Apply the code and record the final total in the quote." }
      - { id: cart, text: "Create a cart with known lines that qualify and lines that are excluded." }
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

A grocer adds an order discount. It applies when the qualifying items reach a minimum subtotal. Some items already have their own discounts. The ticket leaves some rules for the product team to confirm. They cover the threshold details, how discounts combine, and how rounding works.

After the shopper confirms the quoted total, two other amounts must match it. One is the payment authorization in the sandbox, a test payment account that moves no real money. The other is the saved order. The price calculator is pure, so you can call it without a browser and it changes nothing. A sandbox payment account and seeded carts, which are carts set up in advance, are ready for the timed checks.
