---
title: Test document upload visibility
kind: scenario
topic: file-upload
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions settle the upload and download checks?
    choices:
      - { id: limits, text: Which file types and size boundary does the server accept? }
      - { id: progress, text: Does the design call the spinner Uploading or Checking? }
      - { id: pending, text: "Who may download a file, and what should downloads return while review is pending?" }
      - { id: layout, text: What is the preferred thumbnail aspect ratio? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 12 minutes on document availability before and after review.
    budget: 12
    choices:
      - { id: pending, cost: 5, text: Use a held review to confirm the owner cannot download a pending file. }
      - { id: types, cost: 5, text: Upload accepted examples to compare their displayed icons. }
      - { id: approved, cost: 7, text: "Approve the fixture, then verify download works for the owner and stays unavailable to a second tenant." }
      - { id: reorder, cost: 4, text: Change the sort order of previously uploaded attachments. }
  - id: layer
    type: single-choice
    prompt: Which layer first checks for returned bytes while the review is pending?
    choices:
      - { id: ui, text: UI }
      - { id: api, text: API }
      - { id: manual, text: Manual exploratory }
      - { id: unit, text: Unit }
  - id: approved-layer
    type: single-choice
    prompt: Which layer first compares the deployed approved-file response for the two tenant identities?
    choices:
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
      - { id: ui, text: "UI" }
      - { id: api, text: "API" }
  - id: stop
    type: single-choice
    prompt: Which observation blocks release?
    choices:
      - { id: slow, text: The status label updates one second after review completes. }
      - { id: preview, text: The list uses a generic icon for an approved PDF. }
      - { id: data, text: The endpoint sends a pending test document's bytes to its owner. }
      - { id: denied, text: A second tenant receives the documented denial for the approved test document. }
  - id: order
    type: ordering
    prompt: Order a controlled test that uses the same document across the review transition.
    choices:
      - { id: decision, text: Release the held review with an approval result. }
      - { id: download, text: Check owner success and second-tenant denial after approval. }
      - { id: upload, text: Upload a harmless fixture with its review result held. }
      - { id: pending, text: Check the owner's download response while the fixture is still pending. }
reference:
  clarify: [limits, pending]
  risk: [pending, approved]
  layer: api
  approved-layer: api
  stop: data
  order: [upload, pending, decision, download]
decoy:
  clarify: [limits, progress]
  risk: [types, approved]
  layer: ui
  approved-layer: ui
  stop: data
  order: [upload, pending, decision, download]
---

A workspace accepts customer documents and checks them in the background. Downloads must serve bytes only after approval and only to the owning tenant. The new release splits upload and download between two services.

Staging has two fixture tenants, harmless files, and a way to hold and release the review result. The upload limits and exact pending response still need confirmation.
