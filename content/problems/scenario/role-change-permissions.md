---
title: Test which actions a member can take after a role change
kind: scenario
topic: authorization
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions tell you which permission checks to expect after a downgrade?
    choices:
      - { id: label, text: "Should the menu for choosing a role say Editor or Can edit?" }
      - { id: timing, text: "In an existing session, when do changed permissions take effect for other edit operations?" }
      - { id: matrix, text: "Which read and write operations stay available for each role?" }
      - { id: initials, text: "Should the role badge next to a member include their initials?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 12 minutes. Choose checks for correct access after a role change and across workspaces.
    budget: 12
    choices:
      - { id: cache, cost: 7, text: "After downgrading an active editor, check that the next save is denied and reading still works." }
      - { id: isolated, cost: 5, text: "Check that a fixture editor in one workspace has no rights in the other one." }
      - { id: sorting, cost: 4, text: "Compare how role badges are sorted on the page that lists members." }
      - { id: fresh, cost: 5, text: "Sign in as a new editor and look at which menu controls are turned on." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first shows that a save from the old session is denied and leaves the stored data unchanged?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
  - id: isolation-layer
    type: single-choice
    prompt: Which kind of test first checks that the deployed document service denies a fixture editor from another workspace?
    choices:
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the rollout?
    choices:
      - { id: show, text: "An open editor still shows a Save button, but the write is denied with the documented message." }
      - { id: order, text: "Role badges now sort alphabetically, while earlier builds sorted them by permissions." }
      - { id: write, text: "After a confirmed downgrade, the next save still changes the stored document." }
      - { id: read, text: "After the downgrade, the member can still read the document." }
  - id: order
    type: ordering
    prompt: Put the steps of the downgrade check in order, all within one member session.
    choices:
      - { id: stale, text: "Try the next save using the original member session." }
      - { id: baseline, text: "Sign in as the test editor and make a valid save to set the document's starting state." }
      - { id: verify, text: "Check that the save was denied and a separate read shows the starting state unchanged." }
      - { id: downgrade, text: "Have the fixture admin downgrade the member and wait for confirmation." }
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

In a workspace, an editor can read and save documents. A viewer can only read them. An admin can downgrade a member from editor to viewer. Once the admin's downgrade is confirmed, the member's next save must be rejected, even if their editor tab is still open. Membership in one workspace gives no rights in another.

The ticket covers only these document operations. How an existing session handles other operations is still an open question. In staging, use two separate fixture workspaces, test workspaces set up for these checks. For this release, the service must enforce the access rule as soon as the downgrade is confirmed.
