---
title: Test a report export that runs in the background
kind: scenario
topic: reports
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions change what you expect the report to contain?
    choices:
      - { id: filters, text: "Which filters are saved at request time, including any hidden default filters?" }
      - { id: header-style, text: "How should the title be aligned on the page that shows report status?" }
      - { id: filename, text: "Should the default name of the file include the product name?" }
      - { id: columns, text: "Which columns does the file include for the role of the person asking?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 11 minutes. Choose checks that the right rows are included and that CSV cells lose no data.
    budget: 11
    choices:
      - { id: cell, cost: 4, text: "Parse a finished file and compare notes that contain commas and line breaks with the fixture." }
      - { id: snapshot, cost: 7, text: "After holding the worker to edit a fixture row, compare the finished export with the request-time snapshot." }
      - { id: filename, cost: 4, text: "Check the default names given to downloaded files in two different web browsers." }
      - { id: download, cost: 6, text: "Download a static report that has no filters while using two different screen sizes." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first compares fixture changes with the request-time snapshot in the deployed export?
    choices:
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: escaping-layer
    type: single-choice
    prompt: Which kind of test first covers commas, line breaks, and quotes in the pure CSV writer?
    choices:
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the release?
    choices:
      - { id: time, text: "The job waits in the queue for three seconds, within its service target." }
      - { id: icon, text: "When the job is done, the page shows a text link instead of the proposed download icon." }
      - { id: counts, text: "The file includes a record that the saved filter should have left out." }
      - { id: ordering, text: "When no order was requested, the rows use the documented default sort." }
  - id: order
    type: ordering
    prompt: Put the steps of a snapshot check in order. A row changes while the job waits in the queue.
    choices:
      - { id: compare, text: "Download and parse the finished file, then compare it with the saved expectation." }
      - { id: queue, text: "While the worker is held, request the export and save the expected snapshot." }
      - { id: edit, text: "After the export request is accepted, edit the fixture row." }
      - { id: release, text: "Release the worker and wait for that export job to finish." }
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

A support dashboard exports filtered cases as CSV, a text format for a table. The file must use the filters and data from the moment of the request, even if the job waits in a queue. That view of the data is the snapshot. A note that contains commas or line breaks must come back out of the file as one unchanged cell. The team still needs to confirm the full filter defaults and the column list for each role.

In staging, the worker, the background process that builds the file, can be held after the request is accepted. You can release it whenever you choose. The export API reports when the job is complete and returns the finished file. The worker uses a CSV writer, which is pure code that can be called directly with rows held in memory.
