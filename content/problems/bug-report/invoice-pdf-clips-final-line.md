---
title: Report a clipped invoice PDF
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, senior]
items:
  - id: severity
    type: single-choice
    prompt: Which severity fits the loss of visible information in the downloaded file?
    choices:
      - { id: s1, text: "S1, source invoices permanently lost or exposed" }
      - { id: s3, text: "S3, required value unavailable by the usual route with a supported workaround" }
      - { id: s4, text: "S4, appearance issue with every required value readable" }
      - { id: s2, text: "S2, required invoice cannot be provided through a supported route" }
  - id: priority
    type: single-choice
    prompt: Which priority should be proposed for this customer-facing failure?
    choices:
      - { id: p2, text: "P2, in the next billing patch" }
      - { id: p0, text: "P0, halt all invoice processing" }
      - { id: p3, text: "P3, no target date" }
  - id: component
    type: single-choice
    prompt: Which component is the best starting point?
    choices:
      - { id: payment, text: "Invoice payment posting" }
      - { id: records, text: "Invoice record storage" }
      - { id: pdf, text: "Invoice PDF rendering" }
      - { id: mail, text: "Invoice delivery email" }
  - id: title
    type: single-choice
    prompt: Which title names the missing value and the condition?
    choices:
      - { id: blame, text: "PDF template team broke page sizing" }
      - { id: precise, text: "Downloaded two-page invoice clips the amount due" }
      - { id: long, text: "On the invoice test fixture for a two-page bill Firefox on staging 624 asks for a PDF and its last page clips the amount due although the billing portal displays it" }
      - { id: vague, text: "Invoice PDF looks wrong" }
  - id: steps
    type: ordering
    prompt: Order the path that produces the clipped PDF and compares it with the source.
    choices:
      - { id: download, text: "Use Download PDF for that invoice after noting its portal amount." }
      - { id: open, text: "Open the two-page invoice in the staging billing portal." }
      - { id: inspect, text: "Open the downloaded file and compare the final page with the recorded amount." }
      - { id: record, text: "Record the amount due displayed on the portal invoice." }
  - id: missing
    type: multi-select
    prompt: Which missing details would help check the generated file in isolation?
    choices:
      - { id: invoice, text: "Fixture invoice ID and line layout inputs" }
      - { id: build, text: "Staging build number" }
      - { id: portal, text: "Amount due listed in the portal" }
      - { id: file, text: "Redacted PDF sample and name and version of the PDF viewer" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual behavior is evidenced?
    choices:
      - { id: missing, text: "Expected two pages; actual the PDF contains only one." }
      - { id: value, text: "Expected the full amount due to be readable on page two; actual it is clipped at the bottom while the portal shows 82.00." }
      - { id: clipped, text: "Expected the portal amount to display; actual the billing portal has no total." }
      - { id: computed, text: "Expected the total to be 82.00; actual the stored invoice computes 28.00." }
reference:
  severity: s3
  priority: p2
  component: pdf
  title: precise
  steps: [open, record, download, inspect]
  missing: [invoice, file]
  expected: value
decoy:
  severity: s4
  priority: p3
  component: pdf
  title: precise
  steps: [open, record, download, inspect]
  missing: [portal, file]
  expected: value
---

> The total at the foot of my downloaded bill is cut off.

Staging build 624, Firefox 138, test billing account. Screenshot shows page two of the downloaded PDF with the amount due below the visible bottom edge. The portal and billing API both show `82.00`. The PDF must make every invoice value readable. The documented print-from-portal option produces a complete invoice suitable for the customer's records.

Severity: S1 source invoices permanently lost or exposed; S2 required invoice unavailable through any supported route; S3 required value unreadable through the usual route with a supported workaround; S4 appearance only and values readable. Priority: P0 halt invoice processing for missing source invoices or no supported delivery; P2 next billing patch for incomplete files with a valid alternate route; P3 unscheduled appearance cleanup.
