---
title: Report a search count that stays the same after filtering
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the problem you can see?
    choices:
      - { id: s4, text: "S4: All the values are correct and only their appearance is wrong." }
      - { id: s2, text: "S2: The search cannot return the records users need." }
      - { id: s1, text: "S1: The system permanently loses or exposes catalog records." }
      - { id: s3, text: "S3: The count is wrong even though the search finds the right records." }
  - id: priority
    type: single-choice
    prompt: When do the search team's rules say to fix this?
    choices:
      - { id: p1, text: "P1: Fix it in the current search release." }
      - { id: p3, text: "P3: List it as an appearance fix with no date." }
      - { id: p0, text: "P0: Pause the current rollout right away." }
  - id: component
    type: single-choice
    prompt: Given the data the service returned, which part should get the report first?
    choices:
      - { id: backend, text: "The search service that filters results" }
      - { id: ui, text: "The screen that shows results and the filter summary" }
      - { id: index, text: "The job that makes the catalog searchable" }
      - { id: checkout, text: "The code that opens the product details" }
  - id: title
    type: single-choice
    prompt: Which title says exactly what users see go wrong?
    choices:
      - { id: precise, text: "Search still shows the old count after selecting In stock" }
      - { id: long, text: "In Firefox on staging build 901, camp cups starts with 19 matches. In stock returns seven rows, but the heading still says 19 results." }
      - { id: vague, text: "Something is wrong with the search for items in stock" }
      - { id: blame, text: "The search developer broke the code that updates the displayed count" }
  - id: steps
    type: ordering
    prompt: Put the steps that led to the screenshot in order.
    choices:
      - { id: compare, text: "Compare the new response and results list with the heading." }
      - { id: search, text: "Run the test search without filters and note the starting count." }
      - { id: open, text: "In the test account, open the empty search page." }
      - { id: filter, text: "Choose In stock and wait for the service to return filtered results." }
  - id: missing
    type: multi-select
    prompt: Which missing details would help someone repeat and trace the search?
    choices:
      - { id: filter, text: "The name of the filter the tester chose" }
      - { id: data, text: "The version of the catalog used for the test" }
      - { id: correlation, text: "The request ID linking the filtered response to the screenshot" }
      - { id: query, text: "The words the tester entered in the search box" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results match the evidence?
    choices:
      - { id: rows, text: "The list should show seven in-stock matches. Instead, it still shows all 19 unfiltered rows." }
      - { id: indexing, text: "The search should use an up-to-date catalog. Instead, the catalog is missing 12 records." }
      - { id: count, text: "After filtering, the heading should show seven. Instead, it shows 19, though the list and API show seven." }
      - { id: timing, text: "The filter should finish and return matching records. Instead, no response arrives for the filter." }
reference:
  severity: s3
  priority: p1
  component: ui
  title: precise
  steps: [open, search, filter, compare]
  missing: [data, correlation]
  expected: count
decoy:
  severity: s4
  priority: p3
  component: backend
  title: precise
  steps: [open, search, filter, compare]
  missing: [query, correlation]
  expected: count
---

> I chose In stock for camp cups. The page lists seven results. The heading still says 19.

The test used staging build 901 in Firefox 138 with a prepared test catalog. Staging is the test environment. Before filtering, the search for `camp cups` shows 19 matches.

The API is the interface the page uses to ask the search service for results. With **In stock** selected, the API response contains `total=7` and seven matching records. The screenshot after the page finishes updating shows seven results and the old heading. The heading should show the count for the current filter.

Severity tells how serious the bug is:

- S1: The system permanently loses or exposes catalog records.
- S2: The search cannot return the records users need.
- S3: The count is misleading. The results are correct.
- S4: Only the appearance is wrong. The values are correct.

Priority tells when to fix it:

- P0: If the search returns the wrong records, pause the rollout.
- P1: If totals are misleading, fix them in the current search release.
- P3: Put appearance fixes on the list of unscheduled work.
