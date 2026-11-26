---
title: Set CI gates for an invoice migration
kind: scenario
topic: release-risk
difficulty: hard
minutes: 12
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: What must be agreed before a CI result can approve the migration candidate?
    choices:
      - { id: styling, text: "Which colors should the pipeline dashboard use for passed checks?" }
      - { id: invariant, text: "Which invoice IDs, amounts, and settlement links must survive unchanged?" }
      - { id: state, text: "Which interruption and resume states are supported, and which evidence must the gate require?" }
      - { id: copy, text: "What screenshot size should the release notes use?" }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 18 minutes in CI on detecting lost, duplicated, or mislinked invoice data.
    budget: 18
    choices:
      - { id: dashboard, cost: 8, text: "Run screenshots of the invoice dashboard after an uninterrupted migration." }
      - { id: resume, cost: 10, text: "Interrupt one fixture migration, resume it, and compare IDs, sums, and links." }
      - { id: empty, cost: 7, text: "Repeat the startup migration on two empty fixture databases." }
      - { id: reconcile, cost: 8, text: "Compare per-invoice IDs, amounts, and links against an untouched legacy snapshot." }
  - id: layer
    type: single-choice
    prompt: Which layer first tests the pure legacy amount conversion table without a database or deployed job?
    choices:
      - { id: ui, text: "UI" }
      - { id: api, text: "API" }
      - { id: unit, text: "Unit" }
      - { id: manual, text: "Manual exploratory" }
  - id: resume-layer
    type: single-choice
    prompt: Which layer should call the migration service's staging control endpoint and check status and stored results after resuming?
    choices:
      - { id: ui, text: "UI" }
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
  - id: stop
    type: single-choice
    prompt: Which result prevents the gate from approving the candidate?
    choices:
      - { id: resume, text: "The deliberately interrupted rehearsal resumes and satisfies every checked invariant." }
      - { id: links, text: "Invoice counts match but a settlement now points to a different invoice." }
      - { id: format, text: "The gate summary shows the same totals without local number formatting." }
      - { id: timings, text: "The migration runs for 14 minutes inside the agreed rehearsal budget." }
  - id: order
    type: ordering
    prompt: Order the CI gate so approval only follows evidence from the candidate build.
    choices:
      - { id: compare, text: "Reconcile the completed migration and resume results against the approved legacy baseline." }
      - { id: approve, text: "Report approval only when the required results are present and match." }
      - { id: seed, text: "Load the versioned legacy snapshot and record its expected invoice and settlement evidence." }
      - { id: run, text: "Run the candidate migration and interruption rehearsal on separate fixture copies." }
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

Billing will move closed invoices and settlement links to a new schema. Every invoice must retain its ID and amount, and each settlement must remain linked to the same invoice. The migration must support resuming after interruption without duplicates.

The CI stage has 18 minutes, a versioned legacy snapshot, and a staging control endpoint to interrupt and resume runs. It may approve a candidate only after the required fixture checks have run and passed. The full invariant list and supported interruption points still need agreement.
