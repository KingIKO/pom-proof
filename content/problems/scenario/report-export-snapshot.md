---
title: Test an asynchronous report export
kind: scenario
topic: reports
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions change the contents you expect in the report?
    choices:
      - { id: filters, text: "Which filters are captured at request time, including any hidden defaults?" }
      - { id: header-style, text: Which title alignment is preferred on the report status page? }
      - { id: filename, text: Should the default file name include the product name? }
      - { id: columns, text: Which columns are included for the requesting role? }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 11 minutes testing defined row inclusion and lossless CSV cells.
    budget: 11
    choices:
      - { id: cell, cost: 4, text: Parse a completed file and compare notes that include commas and newlines with the fixture. }
      - { id: snapshot, cost: 7, text: "Hold the worker, change a fixture row, and compare the finished export with the request-time snapshot." }
      - { id: filename, cost: 4, text: Verify default file names in two browsers. }
      - { id: download, cost: 6, text: Download a static unfiltered report from two screen sizes. }
  - id: layer
    type: single-choice
    prompt: Which layer first compares fixture changes and the deployed export's request-time snapshot?
    choices:
      - { id: api, text: API }
      - { id: ui, text: UI }
      - { id: unit, text: Unit }
      - { id: manual, text: Manual exploratory }
  - id: escaping-layer
    type: single-choice
    prompt: Which layer first covers commas, line breaks, and quotes in the pure CSV writer?
    choices:
      - { id: manual, text: "Manual exploratory" }
      - { id: api, text: "API" }
      - { id: unit, text: "Unit" }
      - { id: ui, text: "UI" }
  - id: stop
    type: single-choice
    prompt: Which result stops release?
    choices:
      - { id: time, text: The job stays queued for three seconds within its service target. }
      - { id: icon, text: The completed state uses a text link instead of the proposed download icon. }
      - { id: counts, text: The file includes a record excluded by the captured filter. }
      - { id: ordering, text: Rows use the documented default sort when no order was requested. }
  - id: order
    type: ordering
    prompt: Order a snapshot check for a row that changes while a job is queued.
    choices:
      - { id: compare, text: Download and parse the finished file against the saved expectation. }
      - { id: queue, text: Request the export and save the expected snapshot while the worker is held. }
      - { id: edit, text: Edit the fixture row after the export request was accepted. }
      - { id: release, text: Release the worker and wait for that export job to finish. }
reference:
  clarify: [filters, columns]
  risk: [snapshot, cell]
  layer: api
  escaping-layer: unit
  stop: counts
  order: [queue, edit, release, compare]
decoy:
  clarify: [filters, filename]
  risk: [cell, download]
  layer: ui
  escaping-layer: api
  stop: counts
  order: [queue, edit, release, compare]
---

A support dashboard exports filtered cases as CSV. The file must use the filters and data snapshot at request time, even if work is queued. A note containing commas or line breaks must round-trip as one cell. The full filter defaults and column list by role need confirmation.

In staging, the worker can be held after the request is accepted and released on demand. The export API exposes job completion and returns the finished file. The worker uses a CSV writer that can be called with rows in memory.
