---
title: Report an export missing the second page
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
items:
  - id: severity
    type: single-choice
    prompt: Which severity fits the truncated export and the available route?
    choices:
      - { id: s2, text: "S2, a required report cannot be produced by any supported route" }
      - { id: s3, text: "S3, one route gives incomplete results with a supported workaround" }
      - { id: s1, text: "S1, source records lost permanently or exposed" }
      - { id: s4, text: "S4, visual defect with correct data" }
  - id: priority
    type: single-choice
    prompt: Which fix priority fits the monthly handoff policy?
    choices:
      - { id: p0, text: "P0, block work immediately" }
      - { id: p2, text: "P2, schedule after the handoff" }
      - { id: p1, text: "P1, fix before this week's handoff" }
  - id: component
    type: single-choice
    prompt: Which component should get the initial ticket?
    choices:
      - { id: export, text: "CSV export job" }
      - { id: search, text: "Report search results pagination" }
      - { id: storage, text: "Source case retention" }
      - { id: access, text: "Analyst account provisioning" }
  - id: title
    type: single-choice
    prompt: Which title describes what is missing and under which condition?
    choices:
      - { id: vague, text: "Monthly reporting bug" }
      - { id: long, text: "Staging build 552 June case results show 53 matching rows but exporting the ready CSV retrieves only the first 50 reports while the dashboard can show page two" }
      - { id: blame, text: "Export developer forgot to paginate the database query" }
      - { id: precise, text: "CSV export drops matching rows beyond the first report page" }
  - id: steps
    type: ordering
    prompt: Order the evidence from the source count through the file check.
    choices:
      - { id: request, text: "Request a CSV export for the unchanged filtered result." }
      - { id: filter, text: "Apply the June fixture filter and record both pages of matching IDs." }
      - { id: compare, text: "Parse the downloaded rows and compare their IDs with the recorded matches." }
      - { id: download, text: "Download that export after its job reports completion." }
  - id: missing
    type: multi-select
    prompt: What is missing that would let someone inspect and reproduce this exact file?
    choices:
      - { id: count, text: "Expected and actual row counts" }
      - { id: filter, text: "Full saved filter values, including hidden defaults" }
      - { id: browser, text: "Browser name and version" }
      - { id: job, text: "Test job ID and redacted output containing its row identifiers" }
  - id: expected
    type: single-choice
    prompt: Which comparison matches the evidence?
    choices:
      - { id: rows, text: "Expected all 53 matching IDs; actual the file contains exactly the first 50." }
      - { id: split, text: "Expected one file per report page; actual the service returns one combined file." }
      - { id: total, text: "Expected 50 matches; actual the dashboard duplicates three case IDs on page two." }
      - { id: job, text: "Expected the job to finish; actual the download never becomes available." }
reference:
  severity: s3
  priority: p1
  component: export
  title: precise
  steps: [filter, request, download, compare]
  missing: [filter, job]
  expected: rows
decoy:
  severity: s2
  priority: p0
  component: search
  title: precise
  steps: [filter, request, download, compare]
  missing: [count, job]
  expected: rows
---

> My June report shows 53 cases. The CSV only has the 50 on the first page.

Staging build 552, Chrome 138, analyst account. Screenshot shows 53 matches and three more IDs on page two. The completed export parses as 50 data rows with exactly the first page's IDs. Logs record `written=50`. The export must include all filtered matches. The analyst can download two date slices and combine them using the documented procedure.

Severity: S1 source records lost or exposed; S2 no supported route to a required report; S3 a route gives incomplete results but a supported workaround exists; S4 correct data with a visual defect. Priority: P0 current work blocked; P1 before this week's finance handoff for incomplete exports with a workaround; P2 after handoff for presentation issues.
