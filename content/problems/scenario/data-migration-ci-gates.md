---
title: Choose checks before moving invoices to a new database
kind: scenario
topic: release-risk
difficulty: hard
minutes: 12
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: What must the team agree on before a CI result can approve the migration candidate?
    choices:
      - { id: styling, text: "Which colors should the pipeline dashboard use to show checks that passed?" }
      - { id: invariant, text: "Which invoice IDs, amounts, and settlement links must come through the migration unchanged?" }
      - { id: state, text: "Which interruption and resume states are supported, and what evidence must the gate require?" }
      - { id: copy, text: "What size should the screenshots in the release notes be?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 18 minutes in CI. Choose checks that catch invoice data that is lost, duplicated, or linked to the wrong record.
    budget: 18
    choices:
      - { id: dashboard, cost: 8, text: "Take screenshots of the invoice dashboard after a migration that runs without interruption." }
      - { id: resume, cost: 10, text: "Interrupt a migration of fixture data, resume it, and compare the IDs, sums, and links." }
      - { id: empty, cost: 7, text: "Run the startup migration again on two fixture databases that hold no data." }
      - { id: reconcile, cost: 8, text: "For each invoice, compare the ID, amount, and links with an untouched legacy snapshot." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first checks the pure table that converts legacy amounts, without a database or a deployed job?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
      - { id: unit, text: "A unit test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: resume-layer
    type: single-choice
    prompt: After a resume, which kind of test should call the migration service's staging control endpoint and check the status and stored results?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the gate from approving the candidate?
    choices:
      - { id: resume, text: "The rehearsal run, interrupted on purpose, resumes and meets every invariant that was checked." }
      - { id: links, text: "The invoice counts match, but a settlement now points to a different invoice." }
      - { id: format, text: "The gate summary shows the same totals, but without local number formatting." }
      - { id: timings, text: "The migration runs for 14 minutes, within the time agreed for the rehearsal." }
  - id: order
    type: ordering
    prompt: Put the CI gate steps in order. Approval must come only after evidence from the candidate build.
    choices:
      - { id: compare, text: "Check the results of the full migration and the resumed run against the approved legacy baseline." }
      - { id: approve, text: "Report approval only when all the required results are present and they match." }
      - { id: seed, text: "Load the versioned legacy snapshot and record the invoice and settlement evidence you expect." }
      - { id: run, text: "Run the candidate migration and the interruption rehearsal, each on its own fixture copy." }
reference:
  clarify: [invariant, state]
  risk: [resume, reconcile]
  layer: unit
  resume-layer: api
  stop: links
  order: [seed, run, compare, approve]
decoy:
  clarify: [invariant, styling]
  risk: [resume, dashboard]
  layer: ui
  resume-layer: ui
  stop: links
  order: [seed, run, approve, compare]
---

The billing team will move closed invoices and their settlement links to a new database schema. A settlement link ties a settlement record to its invoice. Every invoice must keep its ID and amount. Each settlement must stay linked to the same invoice. If the migration is interrupted, it must be able to resume without creating duplicates.

The CI stage has 18 minutes. It has a versioned snapshot of the legacy data and a staging control endpoint that can interrupt and resume runs. The stage may approve a candidate build only after the required fixture checks have run and passed. The team still needs to agree on the full list of invariants, the facts that must stay true. It also needs to agree on the supported interruption points.
