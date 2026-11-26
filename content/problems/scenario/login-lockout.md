---
title: Test login lockout
kind: scenario
topic: authentication
difficulty: easy
minutes: 7
roles: [manual-qa, automation]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions would you ask before writing the lockout tests?
    choices:
      - { id: wording, text: Should the sign-in heading say Log in or Sign in? }
      - { id: count, text: "Which failures count, and does a successful login reset the count?" }
      - { id: cooldown, text: "When does the cooldown start, and do attempts during it extend it?" }
      - { id: visibility, text: Should the help link open in the same tab? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to nine minutes checking when access is denied and restored.
    budget: 9
    choices:
      - { id: restore, cost: 4, text: Check valid credentials just before and at the cooldown boundary. }
      - { id: browsers, cost: 5, text: Repeat a normal first-attempt login in two desktop browsers. }
      - { id: trigger, cost: 5, text: Compare the attempt that triggers lockout with a separate account one failure short. }
      - { id: help, cost: 3, text: Read the lockout help text on a narrow screen. }
  - id: layer
    type: single-choice
    prompt: Which layer first verifies the deployed service enters lockout on the threshold attempt?
    choices:
      - { id: ui, text: UI }
      - { id: unit, text: Unit }
      - { id: manual, text: Manual exploratory }
      - { id: api, text: API }
  - id: recovery-layer
    type: single-choice
    prompt: Which layer first checks the exact expiry boundary in the pure cooldown predicate?
    choices:
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
      - { id: api, text: "API" }
      - { id: ui, text: "UI" }
  - id: stop
    type: single-choice
    prompt: Which result blocks this release?
    choices:
      - { id: tooltip, text: The help tooltip no longer fades in. }
      - { id: bypass, text: The service creates a session for a locked test account before cooldown ends. }
      - { id: supported, text: Sign-in works at the cooldown boundary with no extra delay. }
      - { id: wrap, text: "The lockout message wraps on mobile, with all text visible." }
  - id: order
    type: ordering
    prompt: Order the evidence for one isolated cooldown run.
    choices:
      - { id: expire, text: Move the staging clock to the stated cooldown boundary. }
      - { id: denied, text: Attempt a valid login during cooldown and record denial. }
      - { id: seed, text: Create the test account with no failed attempts. }
      - { id: allowed, text: Attempt a valid login at the expiry boundary and verify session creation. }
      - { id: lock, text: Record the failed attempt that puts the account into lockout. }
reference:
  clarify: [count, cooldown]
  risk: [trigger, restore]
  layer: api
  recovery-layer: unit
  stop: bypass
  order: [seed, lock, denied, expire, allowed]
decoy:
  clarify: [count, wording]
  risk: [browsers, restore]
  layer: ui
  recovery-layer: ui
  stop: bypass
  order: [seed, lock, denied, expire, allowed]
---

A sign-in service pauses access to an account after repeated bad passwords. Once locked, the service must reject even the correct password until the cooldown ends. The staging clock can be moved, and each run can start with a new test account.

The ticket omits the failure-count and cooldown rules. For the timed smoke test, assume the team has supplied both. The cooldown predicate takes the current time and deadline without calling the service.
