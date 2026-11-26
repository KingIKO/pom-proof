---
title: Plan a feature flag rollout
kind: scenario
topic: release-risk
difficulty: hard
minutes: 11
roles: [sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions belong in the release strategy before deciding whether to expand the cohort?
    choices:
      - { id: announcement, text: "Who will approve the text in the launch announcement?" }
      - { id: assignment, text: "What defines cohort membership and how long must it stay stable?" }
      - { id: rollback, text: "What are the decision metrics, who owns the stop, and what should in-flight quotes do after disablement?" }
      - { id: timing, text: "What time should release notes be published after rollout?" }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 16 minutes proving isolation and recovery before expanding the pilot.
    budget: 16
    choices:
      - { id: split, cost: 7, text: "Compare new quotes for included and excluded accounts, including on a second request." }
      - { id: review, cost: 7, text: "Review every appearance of the redesigned price badge." }
      - { id: rollback, cost: 9, text: "Disable the flag while a pilot quote is open and verify both quote completion and treatment of new quotes." }
      - { id: happy, cost: 8, text: "Repeat quote creation for several newly included accounts." }
  - id: layer
    type: single-choice
    prompt: Which layer first compares persisted quote outcomes for included and excluded accounts against the deployed service?
    choices:
      - { id: unit, text: "Unit" }
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
      - { id: ui, text: "UI" }
  - id: rollback-layer
    type: single-choice
    prompt: Which layer first checks that a customer's open quote still displays its original amount through the confirmation screen after disablement?
    choices:
      - { id: unit, text: "Unit" }
      - { id: manual, text: "Manual exploratory" }
      - { id: api, text: "API" }
      - { id: ui, text: "UI" }
  - id: stop
    type: single-choice
    prompt: What stops expansion immediately?
    choices:
      - { id: label, text: "Pilot accounts see the agreed new formula with the prior help label." }
      - { id: charts, text: "The monitoring panel groups the completed comparison under the correct build ID." }
      - { id: sticky, text: "A pilot quote created before disablement keeps its original amount through completion." }
      - { id: excluded, text: "An excluded account receives a quote from the pilot formula." }
  - id: order
    type: ordering
    prompt: Sequence the pilot decision using evidence from the current candidate build.
    choices:
      - { id: review, text: "Review the tagged pilot results against the agreed criteria and decide whether to expand." }
      - { id: agree, text: "Agree on who owns the stop, the success metrics, and quote recovery rules." }
      - { id: pilot, text: "Start the small production pilot once the rehearsal meets the agreed criteria." }
      - { id: rehearse, text: "Rehearse cohort separation and disablement in staging on the candidate build." }
reference:
  clarify: [assignment, rollback]
  risk: [split, rollback]
  layer: api
  rollback-layer: ui
  stop: excluded
  order: [agree, rehearse, pilot, review]
decoy:
  clarify: [assignment, announcement]
  risk: [split, happy]
  layer: api
  rollback-layer: api
  stop: excluded
  order: [agree, pilot, rehearse, review]
---

An insurance portal will pilot a new quote formula behind a flag. Only selected accounts should receive new-formula quotes. Turning the flag off must return newly created quotes to the old formula while preserving the amounts of existing quotes.

The staged candidate can be tested against separate fixture accounts. Draft the release strategy before expanding beyond the pilot. Assignment rules, decision metrics, and the stop owner still need agreement.
