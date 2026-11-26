---
title: Protect the last pickup slot
kind: scenario
topic: release-risk
difficulty: medium
minutes: 8
roles: [manual-qa, automation]
items:
  - id: release
    type: single-choice
    prompt: Which result stops rollout?
    choices:
      - { id: double-booked, text: Two customers receive confirmed orders for the only slot. }
      - { id: stale-display, text: A second customer briefly sees the slot before booking is rejected. }
      - { id: slow-render, text: The available-times panel takes 700 ms to render. }
  - id: smoke
    type: budgeted-pick
    prompt: Spend up to six minutes on the checks most likely to catch lost or duplicated capacity.
    budget: 6
    choices:
      - { id: concurrent, cost: 4, text: Submit two bookings for the last slot from separate browser contexts. }
      - { id: canceled, cost: 2, text: Cancel a confirmed order and book the newly released slot. }
      - { id: browse, cost: 2, text: Open the pickup panel and check that its hours are formatted. }
      - { id: repeat, cost: 4, text: Repeat a successful booking with multiple slots still available. }
reference:
  release: double-booked
  smoke: [concurrent, canceled]
decoy:
  release: stale-display
  smoke: [concurrent, browse]
---

A grocery app reserves pickup slots during checkout. The release refactors the reservation service. One test store has a single slot left.

A confirmed order must reserve one slot. A cancellation releases that slot once. The app can show stale availability as long as checkout rejects a second booking. Pick a stop condition and spend the six-minute smoke-test budget.
