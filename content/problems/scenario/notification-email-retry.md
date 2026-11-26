---
title: Test notification and email retries
kind: scenario
topic: notifications
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which rules would you confirm before testing duplicate shipment events?
    choices:
      - { id: key, text: Which event ID defines one notification when a delivery is repeated? }
      - { id: icon, text: Should the shipment notification show a truck or a box? }
      - { id: prefs, text: When are email preferences checked and do they apply to the in-app inbox? }
      - { id: length, text: How many characters fit in the email preview text? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 12 minutes on duplicate and wrongly sent messages across the two channels.
    budget: 12
    choices:
      - { id: render, cost: 5, text: Compare the email's layout in two mail clients. }
      - { id: repeat, cost: 7, text: Replay one enabled member's event ID and inspect the mailbox and inbox counts. }
      - { id: opt-out, cost: 5, text: Deliver a fresh event to an opted-out member and inspect both channels. }
      - { id: subject, cost: 4, text: Check shipment subject capitalization in two locales. }
  - id: layer
    type: single-choice
    prompt: Which layer first checks the real worker and both message counts after replaying one event?
    choices:
      - { id: manual, text: Manual exploratory }
      - { id: ui, text: UI }
      - { id: api, text: API }
      - { id: unit, text: Unit }
  - id: preference-layer
    type: single-choice
    prompt: Which layer first covers the pure rule that maps saved preferences to allowed channels?
    choices:
      - { id: ui, text: "UI" }
      - { id: unit, text: "Unit" }
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
  - id: stop
    type: single-choice
    prompt: Which result stops rollout?
    choices:
      - { id: delay, text: The test mailbox receives a permitted message in four seconds within its five-second target. }
      - { id: duplicate, text: One event ID produces two shipment emails for the same enabled member. }
      - { id: copy, text: The email footer uses the approved short support link. }
      - { id: sort, text: The in-app inbox sorts two separate shipments by arrival time as specified. }
  - id: order
    type: ordering
    prompt: Order the replay check so you can attribute a duplicate to the second delivery.
    choices:
      - { id: replay, text: Replay the same event ID and wait for the replay job to finish. }
      - { id: prefs, text: Enable shipment email on a member with empty test inboxes. }
      - { id: first, text: Process the event once and save the initial mailbox and inbox counts. }
      - { id: check, text: Compare final message IDs and counts with the initial ones. }
reference:
  clarify: [key, prefs]
  risk: [repeat, opt-out]
  layer: api
  preference-layer: unit
  stop: duplicate
  order: [prefs, first, replay, check]
decoy:
  clarify: [key, length]
  risk: [repeat, render]
  layer: ui
  preference-layer: api
  stop: duplicate
  order: [prefs, first, replay, check]
---

Shipment events create one in-app notice and, if shipment email is enabled, one email. The event system may deliver the same event again. A repeat must create neither a second notice nor a second email. An opted-out member still gets the in-app notice.

The ticket omits the event identity contract and the point at which the worker reads preferences. Staging provides an event API, a job-completed signal, and fixture mailboxes. The channel decision can also run as a pure function.
