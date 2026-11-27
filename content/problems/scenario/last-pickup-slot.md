---
title: Test whether two shoppers can book the last pickup slot
kind: scenario
topic: release-risk
difficulty: medium
minutes: 8
roles: [manual-qa, automation]
items:
  - id: release
    type: single-choice
    prompt: Which result should stop the rollout?
    choices:
      - { id: double-booked, text: "Two customers both receive confirmed orders for the only slot." }
      - { id: stale-display, text: "A second customer briefly sees the slot, then the booking is rejected." }
      - { id: slow-render, text: "The panel of available times takes 700 ms to appear on screen." }
  - id: smoke
    type: budgeted-pick
    prompt: You have up to six minutes. Choose the checks most likely to catch slot capacity that is lost or counted twice.
    budget: 6
    choices:
      - { id: concurrent, cost: 4, text: "Submit two bookings for the last slot from separate browser contexts (isolated sessions)." }
      - { id: canceled, cost: 2, text: "Cancel a confirmed order, then book the slot that the cancellation released." }
      - { id: browse, cost: 2, text: "Open the pickup panel and check how its opening hours are formatted." }
      - { id: repeat, cost: 4, text: "Repeat a successful booking while several slots are still available." }
reference:
  release: double-booked
  smoke: [concurrent, canceled]
decoy:
  release: stale-display
  smoke: [concurrent, browse]
---

A grocery app reserves a pickup slot during checkout. This release refactors the reservation service, which means its code is restructured and should behave the same way. One test store has only one slot left.

A confirmed order must reserve one slot. A cancellation releases that slot once. The app may show out-of-date availability, as long as checkout rejects a second booking. Choose the result that should stop the rollout. Then spend the six-minute budget on the smoke test, a quick check of the most important paths.
