---
title: Report an export that leaves out second-page results
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the incomplete export given the other way to get the data?
    choices:
      - { id: s2, text: "S2: No supported route can produce a required report." }
      - { id: s3, text: "S3: One route gives incomplete results, with a supported workaround." }
      - { id: s1, text: "S1: The system permanently loses or exposes original records." }
      - { id: s4, text: "S4: The display looks wrong even though the underlying data is correct." }
  - id: priority
    type: single-choice
    prompt: When do the monthly handoff rules say to fix this?
    choices:
      - { id: p0, text: "P0: Block the current work right away." }
      - { id: p2, text: "P2: Schedule the fix after the handoff." }
      - { id: p1, text: "P1: Fix it before this week's handoff." }
  - id: component
    type: single-choice
    prompt: Which part of the system should the report go to first?
    choices:
      - { id: export, text: "The job that writes the CSV" }
      - { id: search, text: "The code that splits results into pages" }
      - { id: storage, text: "The code that keeps original case records" }
      - { id: access, text: "The code that creates analyst accounts" }
  - id: title
    type: single-choice
    prompt: Which title says what is missing and when it happens?
    choices:
      - { id: vague, text: "Something is wrong with the monthly case report" }
      - { id: long, text: "On staging build 552, the June results show 53 matches and the dashboard can show page two. The finished CSV contains only the first 50 cases." }
      - { id: blame, text: "The export developer forgot to read more pages from the database" }
      - { id: precise, text: "CSV export leaves out matches after the first report page" }
  - id: steps
    type: ordering
    prompt: Put the steps in order from checking the search results to checking the file.
    choices:
      - { id: request, text: "Without changing the filter, request a CSV export of the results." }
      - { id: filter, text: "Apply the test filter for June and record matching IDs from both pages." }
      - { id: compare, text: "Read the rows in the download and compare their IDs with your list." }
      - { id: download, text: "Once the export job says it is done, download the file." }
  - id: missing
    type: multi-select
    prompt: Which missing details would let someone check this exact file and make it again?
    choices:
      - { id: count, text: "The expected and actual number of rows" }
      - { id: filter, text: "All saved filter values, including any hidden defaults" }
      - { id: browser, text: "The browser name and version used for the test" }
      - { id: job, text: "The test job ID and a file with row IDs but no private details" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results belong in the report?
    choices:
      - { id: rows, text: "The file should contain all 53 matching IDs. Instead, it contains exactly the first 50." }
      - { id: split, text: "Each report page should have its own file. Instead, the service returns one combined file." }
      - { id: total, text: "The dashboard should show 50 matches. Instead, it repeats three case IDs on page two." }
      - { id: job, text: "The export job should finish and provide a file. Instead, the download never becomes available." }
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

> I see 53 cases in my June report. The CSV has just the 50 cases from the first page.

The test used an analyst account on staging build 552 in Chrome 138. Staging is the test system. The screenshot shows 53 matches, with three IDs on page two. CSV is a text format for a table. The exported CSV has 50 data rows, with exactly the IDs from page one.

The log records `written=50`. The export must include every record that matches the filter. The analyst can download two smaller date ranges and combine them using the documented steps.

Severity tells how serious the bug is:

- S1: The system loses or exposes source records.
- S2: No supported route can produce the required report.
- S3: One route gives incomplete results. A supported workaround exists.
- S4: The display looks wrong. The data is correct.

Priority tells when to fix it:

- P0: Act immediately if current work is blocked.
- P1: If incomplete exports have a workaround, fix them before this week's finance handoff.
- P2: If only appearance is affected, fix it after the handoff.
