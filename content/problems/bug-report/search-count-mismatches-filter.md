---
title: Report a stale search filter count
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
items:
  - id: severity
    type: single-choice
    prompt: Which severity matches the impact shown?
    choices:
      - { id: s4, text: "S4, visual treatment only with correct values" }
      - { id: s2, text: "S2, relevant records cannot be retrieved" }
      - { id: s1, text: "S1, catalog records permanently lost or exposed" }
      - { id: s3, text: "S3, misleading count while the right records remain available" }
  - id: priority
    type: single-choice
    prompt: Which priority follows the search team's policy?
    choices:
      - { id: p1, text: "P1, correct it in the current search release" }
      - { id: p3, text: "P3, unscheduled appearance backlog" }
      - { id: p0, text: "P0, pause the rollout now" }
  - id: component
    type: single-choice
    prompt: Which component should receive the ticket given the response body?
    choices:
      - { id: backend, text: "Search API result filtering" }
      - { id: ui, text: "Search results and filter summary UI" }
      - { id: index, text: "Catalog indexing job" }
      - { id: checkout, text: "Product detail routing" }
  - id: title
    type: single-choice
    prompt: Which title gives the specific visible failure?
    choices:
      - { id: precise, text: "Search result count stays unfiltered after selecting In stock" }
      - { id: long, text: "On Firefox staging build 901 the search for camp cups initially displays 19 and selecting In stock returns seven rows while the heading continues to say 19 results" }
      - { id: vague, text: "The inventory search has a problem" }
      - { id: blame, text: "Search UI developer broke the count binding" }
  - id: steps
    type: ordering
    prompt: Put the actions that produced the screenshot into order.
    choices:
      - { id: compare, text: "Compare the updated response and list with the visible heading." }
      - { id: search, text: "Run the fixture search with no filters and note the initial count." }
      - { id: open, text: "Open the empty search page in the test account." }
      - { id: filter, text: "Select In stock and wait for the filtered response." }
  - id: missing
    type: multi-select
    prompt: What was omitted and would help repeat and trace this case?
    choices:
      - { id: filter, text: "Name of the applied filter" }
      - { id: data, text: "Catalog fixture version" }
      - { id: correlation, text: "Request correlation ID linking the filtered response to the screenshot" }
      - { id: query, text: "Search terms" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual pair is supported?
    choices:
      - { id: rows, text: "Expected seven in-stock matches; actual all 19 unfiltered rows remain in the list." }
      - { id: indexing, text: "Expected an up-to-date catalog; actual 12 catalog records are missing." }
      - { id: count, text: "Expected the heading to show seven after filtering; actual it shows 19 while the list and API show seven." }
      - { id: timing, text: "Expected the filter to finish; actual no filtered response arrives." }
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

> I clicked In stock for camp cups. There are seven results on the page, but the heading still says 19.

Staging build 901, Firefox 138, fixture catalog. Before filtering, the search for `camp cups` shows 19 matches. After selecting **In stock**, the API response contains `total=7` with seven matching records. The settled screenshot shows those seven results and the old heading. The heading should show the count for the active filter.

Severity: S1 permanent loss or exposure of catalog records; S2 relevant records unavailable; S3 misleading count with correct results; S4 presentation issue with correct values. Priority: P0 pause rollout for incorrect returned records; P1 fix misleading totals in the current search release; P3 appearance backlog.
