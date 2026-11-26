---
title: Test refunds after a lost response
kind: scenario
topic: payments
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which answers define what a retry and a second partial refund should do?
    choices:
      - { id: comment, text: Is the button's internal design name Refund or Issue refund? }
      - { id: identity, text: What identifies the original refund operation across retries? }
      - { id: balance, text: "What event releases a reservation if the provider eventually refuses the refund?" }
      - { id: logo, text: Which provider logo appears on the help page? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 15 minutes on duplicate and excess money movement.
    budget: 15
    choices:
      - { id: email, cost: 6, text: Compare sandbox refund email wording for two order types. }
      - { id: uncertain, cost: 9, text: "Let the provider record a partial refund, lose the reply, and retry the same operation." }
      - { id: currency, cost: 5, text: Verify currency labels on the completed refunds list. }
      - { id: remaining, cost: 6, text: "With a refund pending, give a separate refund amount that exceeds the unreserved balance." }
  - id: layer
    type: single-choice
    prompt: Which layer first verifies the application operation, provider record, and balance together in the sandbox?
    choices:
      - { id: ui, text: UI }
      - { id: unit, text: Unit }
      - { id: api, text: API }
      - { id: manual, text: Manual exploratory }
  - id: balance-layer
    type: single-choice
    prompt: Which layer first tests the pure rule that compares a new refund amount with unreserved balance?
    choices:
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
      - { id: ui, text: "UI" }
  - id: stop
    type: single-choice
    prompt: Which outcome stops rollout?
    choices:
      - { id: recorded-twice, text: One operation creates two monetary refunds at the sandbox provider. }
      - { id: pending, text: The dashboard reports an unknown outcome as pending as required. }
      - { id: history, text: The history shows a partial refund before the original charge in newest-first order. }
      - { id: delay, text: The test ledger settles within the stated reconciliation time. }
  - id: order
    type: ordering
    prompt: Order the run that tests a response lost after the provider records the refund.
    choices:
      - { id: retry, text: Retry through the application with the original operation ID. }
      - { id: reconcile, text: Reconcile provider refund IDs and the application's final balance. }
      - { id: inject, text: Submit one refund and hold its successful reply until the application times out. }
      - { id: seed, text: Create a settled sandbox charge and record its amount and available balance. }
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

A store supports partial refunds. The sandbox can hold a successful provider reply until the app times out. Repeating the same known operation must produce at most one financial refund, and a pending refund reserves its share of the balance. Subsequent refunds cannot exceed the unreserved amount.

The ticket omits the operation identity contract and the balance state shown during reconciliation. The amount check is a pure helper that takes the balance and reservation amounts. The team can answer the open questions before the timed checks begin.
