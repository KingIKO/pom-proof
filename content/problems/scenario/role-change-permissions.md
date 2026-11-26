---
title: Test a workspace role change
kind: scenario
topic: authorization
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions establish the expected permission checks after a downgrade?
    choices:
      - { id: label, text: Should the role selector say Editor or Can edit? }
      - { id: timing, text: When do changed permissions take effect for other edit operations in an existing session? }
      - { id: matrix, text: Which read and write operations remain available for each role? }
      - { id: initials, text: Should the role badge include the member's initials? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 12 minutes on correct access after role changes and across workspaces.
    budget: 12
    choices:
      - { id: cache, cost: 7, text: Downgrade an active editor and confirm the next save is denied while reading still works. }
      - { id: isolated, cost: 5, text: Verify a fixture editor in one workspace has no rights in the other. }
      - { id: sorting, cost: 4, text: Compare role badge sorting on the members page. }
      - { id: fresh, cost: 5, text: Sign in as a fresh editor and inspect which menu controls are enabled. }
  - id: layer
    type: single-choice
    prompt: Which layer first proves a save from the old session is denied and leaves persisted state unchanged?
    choices:
      - { id: ui, text: UI }
      - { id: manual, text: Manual exploratory }
      - { id: unit, text: Unit }
      - { id: api, text: API }
  - id: isolation-layer
    type: single-choice
    prompt: Which layer first verifies that the deployed document service denies a fixture editor from another workspace?
    choices:
      - { id: unit, text: "Unit" }
      - { id: api, text: "API" }
      - { id: ui, text: "UI" }
      - { id: manual, text: "Manual exploratory" }
  - id: stop
    type: single-choice
    prompt: Which result stops rollout?
    choices:
      - { id: show, text: "An open editor still displays a Save button, but the write is denied with the documented message." }
      - { id: order, text: Role badges sort alphabetically when previous builds sorted by permissions. }
      - { id: write, text: The next save after a confirmed downgrade changes the stored document. }
      - { id: read, text: The downgraded member can still read the document. }
  - id: order
    type: ordering
    prompt: Order the downgrade check within one member session.
    choices:
      - { id: stale, text: Attempt the next save with the original member session. }
      - { id: baseline, text: Sign in as the test editor and establish the stored document baseline with a valid save. }
      - { id: verify, text: Check the save was denied and an independent read shows the baseline unchanged. }
      - { id: downgrade, text: Have the fixture admin downgrade the member and wait for confirmation. }
reference:
  clarify: [timing, matrix]
  risk: [cache, isolated]
  layer: api
  isolation-layer: api
  stop: write
  order: [baseline, downgrade, stale, verify]
decoy:
  clarify: [timing, label]
  risk: [cache, fresh]
  layer: ui
  isolation-layer: unit
  stop: show
  order: [baseline, downgrade, stale, verify]
---

A workspace editor can read and save documents. A viewer can read only. Once the admin's downgrade is confirmed, the member's next save must be rejected, even if their editor tab is still open. Membership in one workspace grants no rights in another.

The ticket covers these document operations only, and the broader session behavior for other operations is still open. Use two isolated staging workspaces. The immediate release gate is enforced by the service.
