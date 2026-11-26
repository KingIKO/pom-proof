---
title: Test booking across a clock change
kind: scenario
topic: booking
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which answers tell you what appointment times can be booked?
    choices:
      - { id: display, text: Which time zone is shown on confirmation when the device uses a different zone? }
      - { id: icon, text: Which calendar icon should the booking button use? }
      - { id: marketing, text: Which city should be named in the launch email? }
      - { id: transitions, text: How are missing spring times and repeated autumn times represented to customers? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 13 minutes checking that each displayed slot maps to the right instant.
    budget: 13
    choices:
      - { id: gap, cost: 5, text: Check that the spring gap does not produce a selectable appointment. }
      - { id: fold, cost: 8, text: Compare both repeated autumn slots and follow the second into the booking confirmation. }
      - { id: format, cost: 5, text: Compare the calendar's month headings across two languages. }
      - { id: afternoon, cost: 7, text: Book a normal afternoon appointment on a week without a clock change. }
  - id: layer
    type: single-choice
    prompt: Which layer first checks that the pure conversion helper returns no possible instants for a spring gap time?
    choices:
      - { id: api, text: API }
      - { id: manual, text: Manual exploratory }
      - { id: ui, text: UI }
      - { id: unit, text: Unit }
  - id: fold-layer
    type: single-choice
    prompt: Which layer first proves the two rendered autumn slots are distinguishable and booking the second confirms the right one?
    choices:
      - { id: ui, text: "UI" }
      - { id: manual, text: "Manual exploratory" }
      - { id: api, text: "API" }
      - { id: unit, text: "Unit" }
  - id: stop
    type: single-choice
    prompt: Which result stops the release?
    choices:
      - { id: long, text: The zone label wraps without clipping in a narrow viewport. }
      - { id: wrong-instant, text: Selecting the second repeated slot confirms the instant for the first slot. }
      - { id: gap, text: The spring calendar skips a time that never occurs at the venue. }
      - { id: format, text: The confirmation uses a 24-hour clock in its supported locale. }
  - id: order
    type: ordering
    prompt: Order the run so the recorded expected instant is independent of the service response.
    choices:
      - { id: compare, text: Compare the confirmed instant with the recorded expectation. }
      - { id: book, text: Book the slot labeled as the second occurrence. }
      - { id: fixture, text: Load the venue fixture with both autumn occurrences available. }
      - { id: expected, text: Identify the second occurrence from the fixture's zone and record its expected instant before booking. }
reference:
  clarify: [display, transitions]
  risk: [gap, fold]
  layer: unit
  fold-layer: ui
  stop: wrong-instant
  order: [fixture, expected, book, compare]
decoy:
  clarify: [display, marketing]
  risk: [gap, afternoon]
  layer: ui
  fold-layer: api
  stop: wrong-instant
  order: [fixture, book, expected, compare]
---

A class booking app lists appointments in the venue's local time. It hides times skipped by the spring clock change. When two autumn slots have the same local time, the user must be able to tell them apart and the selected slot must retain its exact instant through confirmation.

The ticket leaves the customer-facing zone labels and repeated-time notation open. Staging has spring and autumn fixtures with authoritative expected instants and a pure time conversion helper.
