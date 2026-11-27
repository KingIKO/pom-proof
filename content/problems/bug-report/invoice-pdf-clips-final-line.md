---
title: Report an invoice PDF that cuts off the total
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, senior]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the bug when the download cuts off a required value?
    choices:
      - { id: s1, text: "S1: The system permanently loses or exposes the original invoices." }
      - { id: s3, text: "S3: A required value needs a supported workaround to be readable." }
      - { id: s4, text: "S4: Every required value is readable despite the appearance issue." }
      - { id: s2, text: "S2: No supported route can provide the invoice users need." }
  - id: priority
    type: single-choice
    prompt: When should the team fix this issue that customers see?
    choices:
      - { id: p2, text: "P2: Fix it in the next billing update." }
      - { id: p0, text: "P0: Stop processing all invoices now." }
      - { id: p3, text: "P3: Leave the fix without a date." }
  - id: component
    type: single-choice
    prompt: Which part of the system should you check first?
    choices:
      - { id: payment, text: "The service that records invoice payments" }
      - { id: records, text: "The service that stores invoice records" }
      - { id: pdf, text: "The service that creates invoice PDFs" }
      - { id: mail, text: "The service that emails invoices" }
  - id: title
    type: single-choice
    prompt: Which title says what the user cannot read and when?
    choices:
      - { id: blame, text: "The PDF template team broke the invoice page size" }
      - { id: precise, text: "Two-page invoice download cuts off the amount due" }
      - { id: long, text: "In Firefox on staging 624, the two-page test invoice PDF cuts off the amount due on its last page. The billing portal shows the amount." }
      - { id: vague, text: "Something looks wrong in the downloaded invoice PDF" }
  - id: steps
    type: ordering
    prompt: Put the steps for comparing the downloaded PDF with the source in order.
    choices:
      - { id: download, text: "Once you have the amount, select Download PDF for that invoice." }
      - { id: open, text: "In the staging billing portal, open the two-page invoice." }
      - { id: inspect, text: "Open the PDF and compare the last page with the amount you noted." }
      - { id: record, text: "Note the amount due that the billing portal shows." }
  - id: missing
    type: multi-select
    prompt: Which missing details would let someone check the downloaded file on its own?
    choices:
      - { id: invoice, text: "The test invoice ID and inputs that set the line layout" }
      - { id: build, text: "The build number for the staging billing portal" }
      - { id: portal, text: "The amount due shown on the portal invoice" }
      - { id: file, text: "A PDF without private details and the viewer name and version" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results match what you can see?
    choices:
      - { id: missing, text: "The downloaded PDF should contain two full pages. Instead, the file has only one page." }
      - { id: value, text: "The amount due should be readable on page two. Instead, the PDF cuts it off at the bottom, and the portal shows 82.00." }
      - { id: clipped, text: "The portal should show the amount due on the invoice. Instead, the billing portal shows no total." }
      - { id: computed, text: "The total should be 82.00 on this invoice. Instead, the stored invoice calculates 28.00." }
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

> My downloaded bill cuts off the total at the bottom.

The test used a test billing account on staging build 624 in Firefox 138. Staging is the test environment. The screenshot shows that page two of the PDF cuts off the amount due below the bottom edge. The portal and the billing API, the interface the app uses to request billing data, both show `82.00`.

Users must be able to read every invoice value in the PDF. The documented option to print from the portal gives the customer a complete invoice for their records.

Severity tells how serious the bug is:

- S1: The system permanently loses or exposes original invoices.
- S2: No supported route can provide a required invoice.
- S3: Users cannot read a required value by the usual route. A supported workaround exists.
- S4: Only the appearance is wrong. Users can read the values.

Priority tells when to fix it:

- P0: If original invoices are missing or no supported delivery route works, stop invoice processing.
- P2: If incomplete files have a valid workaround, fix them in the next billing update.
- P3: Leave appearance fixes without a date.
