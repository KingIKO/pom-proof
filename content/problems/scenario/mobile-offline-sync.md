---
title: Test whether offline edits survive a restart and reconnect
kind: scenario
topic: mobile-sync
difficulty: hard
minutes: 10
roles: [manual-qa, automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: What would you ask before you test offline edits on a device?
    choices:
      - { id: badge, text: "Should the offline badge sit above the navigation bar or below it?" }
      - { id: animation, text: "Should the reconnect indicator fade in, or should it appear at once?" }
      - { id: durability, text: "Which pending edits must survive closing the app or restarting the device?" }
      - { id: conflict, text: "When a server update conflicts with the saved edit, what should the worker and user see?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 15 minutes. Choose checks that catch lost edits after an interruption or a conflict.
    budget: 15
    choices:
      - { id: restart, cost: 8, text: "Save offline, close and reopen the app before reconnecting, then check the server copy." }
      - { id: conflict, cost: 7, text: "Check that saving offline over dispatch's changed version keeps the local edit." }
      - { id: theme, cost: 5, text: "Compare the look of the offline indicator in the app's dark and light modes." }
      - { id: online, cost: 7, text: "On another supported phone, edit two records while the connection stays stable." }
  - id: layer
    type: single-choice
    prompt: When no device automation is available, which kind of test first explores combinations of app closing, restarts, and reconnection on a real device?
    choices:
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
  - id: conflict-layer
    type: single-choice
    prompt: The edit started from a different version than the one dispatch saved. Which kind of test first checks whether the pure sync reducer keeps the edit?
    choices:
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the rollout?
    choices:
      - { id: data, text: "A saved offline edit is gone after the app is closed and reopened." }
      - { id: pending, text: "A pending edit stays visible on the phone until the device reconnects." }
      - { id: label, text: "The offline banner shows the same wording as before after the app reopens." }
      - { id: conflict, text: "A conflicting edit stays available on the phone so the user can resolve it." }
  - id: order
    type: ordering
    prompt: Put the steps in order. The test checks that the edit is saved on the device before any network sync.
    choices:
      - { id: reconnect, text: "Reconnect once you have confirmed the pending edit is still there." }
      - { id: reopen, text: "While still offline, close and reopen the app, then read the pending value." }
      - { id: verify, text: "After the sync finishes, open a separate online view and check the saved value." }
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

Field staff edit work orders on a phone with no network coverage. When the app confirms an offline edit as saved, that edit must survive closing and reopening the app. If the dispatch team changes the same work order first, there is a conflict. The app must keep the local edit so someone can resolve the conflict.

The ticket leaves open which restarts must be covered and how conflicts work. Today you have a real test device and a separate online view of the data. No device automation is available. The sync reducer is a pure function, so it works only from its inputs. It looks at the versions of pending edits and the server result, and decides which edits to keep.
