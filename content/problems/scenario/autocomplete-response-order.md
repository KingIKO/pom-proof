---
title: Test search autocomplete response order
kind: scenario
topic: search
difficulty: medium
minutes: 8
roles: [automation, sdet, manual-qa]
items:
  - id: clarify
    type: multi-select
    prompt: Which behavior rules affect what remains visible when typing or clearing a search?
    choices:
      - { id: icon, text: Should the magnifier be filled or outlined? }
      - { id: minimum, text: "What query length is eligible, and what happens below it?" }
      - { id: ownership, text: "May old suggestions remain during a new request, and what may still be selected?" }
      - { id: margins, text: How much white space should surround the suggestions panel? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to ten minutes checking stale suggestions under delayed responses.
    budget: 10
    choices:
      - { id: out-of-order, cost: 6, text: Deliver the current query response first and the older response last. }
      - { id: fixtures, cost: 6, text: Compare suggestions for common products with fast responses. }
      - { id: styling, cost: 3, text: Compare the highlight color in both themes. }
      - { id: clear, cost: 4, text: Clear the query with a delayed response outstanding and check the list stays empty. }
  - id: layer
    type: single-choice
    prompt: Which layer first proves stale suggestions cannot take over the rendered list or keyboard selection?
    choices:
      - { id: api, text: API }
      - { id: unit, text: Unit }
      - { id: ui, text: UI }
      - { id: manual, text: Manual exploratory }
  - id: clear-layer
    type: single-choice
    prompt: Which layer first proves that clearing the field keeps the rendered suggestions closed when a held reply arrives?
    choices:
      - { id: ui, text: "UI" }
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
  - id: stop
    type: single-choice
    prompt: Which behavior blocks release?
    choices:
      - { id: stale, text: "After the new list appears, a late reply makes Enter open a product from the old query." }
      - { id: no-result, text: A query with no matches shows the documented empty state. }
      - { id: width, text: The list aligns a pixel left of the search box. }
      - { id: spinner, text: A loading spinner appears on the authorized slow connection. }
  - id: order
    type: ordering
    prompt: Order a run that observes the current list before a stale reply arrives.
    choices:
      - { id: late, text: Deliver the held older reply. }
      - { id: current, text: "Type the longer query, deliver its reply, and verify its list is visible." }
      - { id: verify, text: Confirm the current list stays visible and Enter selects its current result. }
      - { id: early, text: Type the first eligible query and hold its reply. }
reference:
  clarify: [minimum, ownership]
  risk: [out-of-order, clear]
  layer: ui
  clear-layer: ui
  stop: stale
  order: [early, current, late, verify]
decoy:
  clarify: [minimum, icon]
  risk: [fixtures, clear]
  layer: ui
  clear-layer: ui
  stop: stale
  order: [early, current, late, verify]
---

An inventory app adds a keyboard-selectable suggestion list. Typing can start a new request before the last one finishes. Once the current list appears, replies to older queries must never replace it. Clearing the box closes the list and invalidates every pending reply.

The spec omits the minimum query length and what may stay selectable while the current answer is pending. The test environment can hold and deliver replies independently.
