---
title: Test what happens when a refund reply goes missing
kind: scenario
topic: payments
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which answers tell you what a retry and a second partial refund should do?
    choices:
      - { id: comment, text: "In the internal design files, is the button named Refund or Issue refund?" }
      - { id: identity, text: "What marks a retry as the same refund operation as the original one?" }
      - { id: balance, text: "If the provider later refuses the refund, which event releases the reserved amount?" }
      - { id: logo, text: "Which logo of the payment provider appears on the help page?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 15 minutes. Choose checks for money that moves twice or moves more than it should.
    budget: 15
    choices:
      - { id: email, cost: 6, text: "Compare the wording of sandbox refund emails for two types of order." }
      - { id: uncertain, cost: 9, text: "Let the provider record a partial refund, lose its reply, and retry the same operation." }
      - { id: currency, cost: 5, text: "Check the currency labels next to each amount on the list of completed refunds." }
      - { id: remaining, cost: 6, text: "While one refund is pending, request a separate refund larger than the unreserved balance." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first checks the app's operation, the provider's record, and the balance together in the sandbox?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: balance-layer
    type: single-choice
    prompt: Which kind of test first checks the pure rule that compares a new refund amount with the unreserved balance?
    choices:
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the rollout?
    choices:
      - { id: recorded-twice, text: "One operation creates two refunds of money at the sandbox provider." }
      - { id: pending, text: "As required, the dashboard reports an unknown outcome as pending." }
      - { id: history, text: "In newest-first order, the history lists a partial refund before the original charge." }
      - { id: delay, text: "The test ledger settles within the stated time for reconciliation." }
  - id: order
    type: ordering
    prompt: Put the steps in order. The run tests a reply that is lost after the provider records the refund.
    choices:
      - { id: retry, text: "Retry through the app with the original operation ID." }
      - { id: reconcile, text: "Reconcile the provider's refund IDs with the app's final balance." }
      - { id: inject, text: "Submit one refund and hold its successful reply until the app times out." }
      - { id: seed, text: "Create a settled sandbox charge and record its amount and available balance." }
reference:
  clarify: [identity, balance]
  risk: [uncertain, remaining]
  layer: api
  balance-layer: unit
  stop: recorded-twice
  order: [seed, inject, retry, reconcile]
decoy:
  clarify: [identity, comment]
  risk: [uncertain, email]
  layer: ui
  balance-layer: api
  stop: recorded-twice
  order: [seed, inject, retry, reconcile]
---

A store supports partial refunds, which return only part of a payment. The provider's sandbox, a test payment system that moves no real money, can hold a successful reply until the app times out. If the app repeats the same known operation, it must create at most one financial refund. A pending refund reserves its share of the balance. Later refunds cannot go over the unreserved amount.

The ticket leaves out the operation identity contract, the rule for what counts as the same refund operation. It also leaves out the balance state shown during reconciliation, when the app matches its records with the provider's. The amount check is a pure helper that takes the balance and reservation amounts as inputs. The team can answer the open questions before the timed checks begin.
