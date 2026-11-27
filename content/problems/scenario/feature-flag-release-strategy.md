---
title: Plan a release that uses a feature flag
kind: scenario
topic: release-risk
difficulty: hard
minutes: 11
roles: [sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Before you decide whether to expand the cohort, which questions belong in the release strategy?
    choices:
      - { id: announcement, text: "Who will approve the wording in the announcement that tells customers about the launch?" }
      - { id: assignment, text: "What decides which accounts are in the cohort, and how long must that stay fixed?" }
      - { id: rollback, text: "Which metrics decide, who owns the stop, and what happens to open quotes once the flag is off?" }
      - { id: timing, text: "What time should the release notes be published after the rollout is complete?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 16 minutes before the pilot grows. Choose checks that show the cohort stays separate and that turning the flag off recovers safely.
    budget: 16
    choices:
      - { id: split, cost: 7, text: "Compare new quotes for accounts in and out of the cohort, and repeat with a second request." }
      - { id: review, cost: 7, text: "Review every page and screen in the portal where the redesigned price badge now appears." }
      - { id: rollback, cost: 9, text: "With a pilot quote open, turn off the flag and check quote completion and new quote prices." }
      - { id: happy, cost: 8, text: "Create new quotes again for several accounts that were only just added to the pilot cohort." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first compares saved quote results from the deployed service for accounts in and out of the cohort?
    choices:
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: ui, text: "An automated UI test" }
  - id: rollback-layer
    type: single-choice
    prompt: After the flag is off, which kind of test first checks that a customer's open quote shows its original amount through the confirmation screen?
    choices:
      - { id: unit, text: "A unit test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
  - id: stop
    type: single-choice
    prompt: What should stop the expansion right away?
    choices:
      - { id: label, text: "Pilot accounts get the agreed new formula but still see the old help label." }
      - { id: charts, text: "The monitoring panel lists the completed comparison under the correct build ID." }
      - { id: sticky, text: "A pilot quote made before the flag was turned off keeps its original amount until completion." }
      - { id: excluded, text: "An account outside the cohort receives a quote priced by the pilot formula." }
  - id: order
    type: ordering
    prompt: Put the steps of the pilot decision in order. Use evidence from the current candidate build.
    choices:
      - { id: review, text: "Review the tagged pilot results against the agreed criteria, and decide whether to expand." }
      - { id: agree, text: "Agree on who owns the stop, which metrics mean success, and the rules for recovering quotes." }
      - { id: pilot, text: "Once the rehearsal meets the agreed criteria, start the small pilot in production." }
      - { id: rehearse, text: "In staging, rehearse keeping the cohort separate and turning the flag off on the candidate build." }
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

An insurance portal will pilot a new formula for price quotes behind a feature flag. A feature flag is a setting that turns a feature on or off without a new release. Only selected accounts, called the cohort, should get quotes from the new formula. When the flag is turned off, newly created quotes must go back to the old formula. Quotes that already exist must keep their amounts.

You can test the staged candidate build with separate fixture accounts, which are test accounts set up for this work. Draft the release strategy before the pilot grows to more accounts. The team still needs to agree on how accounts are assigned and which metrics drive the decision. It also needs to name who owns the decision to stop.
