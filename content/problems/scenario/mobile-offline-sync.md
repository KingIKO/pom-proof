---
title: Test offline edits after reconnect
kind: scenario
topic: mobile-sync
difficulty: hard
minutes: 10
roles: [manual-qa, automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: What would you ask before testing offline edits on a device?
    choices:
      - { id: badge, text: "Should the offline badge sit above or below the navigation bar?" }
      - { id: animation, text: "Should the reconnect indicator fade in or appear at once?" }
      - { id: durability, text: "Which pending edits must survive app closure or a device restart?" }
      - { id: conflict, text: "What should the worker and user see when a server update conflicts with the saved edit?" }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 15 minutes on preventing lost edits after interruption and conflict.
    budget: 15
    choices:
      - { id: restart, cost: 8, text: "Save offline and close the app, then reopen before reconnecting and check the server copy." }
      - { id: conflict, cost: 7, text: "Save offline over a version changed by dispatch and check that the conflict retains the local edit." }
      - { id: theme, cost: 5, text: "Compare the offline indicator in dark and light modes." }
      - { id: online, cost: 7, text: "Edit two records over a stable connection on another supported phone." }
  - id: layer
    type: single-choice
    prompt: Which layer first investigates real-device lifecycle and reconnection combinations when no device automation is available?
    choices:
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
      - { id: ui, text: "UI automation" }
      - { id: unit, text: "Unit" }
  - id: conflict-layer
    type: single-choice
    prompt: Which layer first checks that the pure sync reducer retains an edit when its base version differs from dispatch's version?
    choices:
      - { id: unit, text: "Unit" }
      - { id: ui, text: "UI automation" }
      - { id: manual, text: "Manual exploratory" }
      - { id: api, text: "API" }
  - id: stop
    type: single-choice
    prompt: Which result stops rollout?
    choices:
      - { id: data, text: "A saved offline edit disappears after closing and reopening the app." }
      - { id: pending, text: "A pending edit remains visible until the device reconnects." }
      - { id: label, text: "The offline banner uses the same wording after reopening." }
      - { id: conflict, text: "A conflicting edit stays available for the user to resolve." }
  - id: order
    type: ordering
    prompt: Order the test that isolates persistence before network sync.
    choices:
      - { id: reconnect, text: "Reconnect after confirming the pending edit is still present." }
      - { id: reopen, text: "Close and reopen offline, then read the pending value." }
      - { id: verify, text: "After sync completes, open an independent online view and check the saved value." }
      - { id: save, text: "Take the device offline, save a fixture edit, and record the pending value." }
reference:
  clarify: [durability, conflict]
  risk: [restart, conflict]
  layer: manual
  conflict-layer: unit
  stop: data
  order: [save, reopen, reconnect, verify]
decoy:
  clarify: [durability, badge]
  risk: [restart, online]
  layer: api
  conflict-layer: api
  stop: data
  order: [save, reconnect, reopen, verify]
---

Field staff edit work orders on a phone without coverage. An acknowledged offline edit must survive closing and reopening the app. If dispatch changed the work order first, the conflict must preserve the local edit for resolution rather than discarding it.

The ticket leaves restart coverage and conflict details open. A real test device and an independent online view are available today. Device automation is unavailable. A pure sync reducer decides which pending edits to keep from their versions and the server result.
