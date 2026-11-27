---
title: Test who can download an uploaded document and when
kind: scenario
topic: file-upload
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions decide what the upload and download checks should expect?
    choices:
      - { id: limits, text: "Which file types and which size limit does the server accept?" }
      - { id: progress, text: "Does the design label the progress spinner Uploading or Checking while it runs?" }
      - { id: pending, text: "Who may download a file, and what should a download return while review is pending?" }
      - { id: layout, text: "What shape should file thumbnails have, as a ratio of width to height?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 12 minutes. Choose checks for who can get a document before and after review.
    budget: 12
    choices:
      - { id: pending, cost: 5, text: "Hold the review, then check that the owner cannot download the pending file." }
      - { id: types, cost: 5, text: "Upload accepted example files and compare the icons that the list shows for them." }
      - { id: approved, cost: 7, text: "After approving the fixture file, check that the owner can download it and a second tenant still cannot." }
      - { id: reorder, cost: 4, text: "Change the sort order of attachments that were uploaded earlier, and check the new order." }
  - id: layer
    type: single-choice
    prompt: While the review is pending, which kind of test first checks whether any file bytes come back?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
  - id: approved-layer
    type: single-choice
    prompt: Which kind of test first compares how the deployed service answers each of the two tenants for the approved file?
    choices:
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
  - id: stop
    type: single-choice
    prompt: Which observation should block the release?
    choices:
      - { id: slow, text: "The status label updates one second after the review completes." }
      - { id: preview, text: "The file list shows a generic icon for an approved PDF." }
      - { id: data, text: "The endpoint sends the bytes of a pending test document to its owner." }
      - { id: denied, text: "A second tenant gets the documented denial when it asks for the approved test document." }
  - id: order
    type: ordering
    prompt: Put the steps in order. Use the same document while its review status changes.
    choices:
      - { id: decision, text: "Release the held review so that it returns an approval." }
      - { id: download, text: "After approval, check that the owner can download and the second tenant is denied." }
      - { id: upload, text: "Upload a harmless fixture file and hold its review result." }
      - { id: pending, text: "While the fixture is still pending, check the response to the owner's download." }
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

A workspace accepts customer documents and reviews them in the background. A download may return the file's bytes only after the review approves the file. It may return them only to the tenant, the customer account, that owns the file. The new release splits upload and download into two separate services.

Staging has two fixture tenants, which are test accounts set up for this work. It also has harmless test files and a way to hold the review result and release it later. The team still needs to confirm the upload limits and the exact response while a review is pending.
