---
title: Report settlement links that change during a migration
kind: bug-report
topic: defect-reporting
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the bug under the accounting team's rules?
    choices:
      - { id: s1, text: "S1: The stored links between invoices and settlements are wrong." }
      - { id: s3, text: "S3: A secondary report is wrong even though the stored links are correct." }
      - { id: s4, text: "S4: The issue affects only how the information looks on screen." }
      - { id: s2, text: "S2: A required task is blocked without any damage to the stored data." }
  - id: priority
    type: single-choice
    prompt: What should the team do about the scheduled switch?
    choices:
      - { id: p2, text: "P2: Fix it during the next maintenance window." }
      - { id: p1, text: "P1: Switch as planned and fix it before the first finance report." }
      - { id: p0, text: "P0: Block the switch the team has scheduled." }
  - id: component
    type: single-choice
    prompt: Given the records before and after the run, where should the team look first?
    choices:
      - { id: cards, text: "The code that displays the billing dashboard" }
      - { id: mapper, text: "The migration that links invoices and settlements" }
      - { id: processors, text: "The requests to the live payment provider" }
      - { id: filters, text: "The filters that select finance report data" }
  - id: title
    type: single-choice
    prompt: Which title says exactly what went wrong?
    choices:
      - { id: blame, text: "The migration author used the wrong field to join records again" }
      - { id: vague, text: "Something is wrong with the results of the migration" }
      - { id: long, text: "On staging build 1003, the billing migration keeps both test invoices and their combined total. It changes which invoices ST-7 and ST-8 link to." }
      - { id: precise, text: "Invoice migration swaps the stored invoice links for two settlements" }
  - id: steps
    type: ordering
    prompt: Put the steps for checking the links before and after the migration in order.
    choices:
      - { id: baseline, text: "Record the invoice and settlement links from the untouched test copy." }
      - { id: compare, text: "After the run, compare the same settlement IDs with the original links." }
      - { id: migrate, text: "Run the proposed migration on a copy you can discard." }
      - { id: load, text: "Load the copy of the old staging data into a separate test environment." }
  - id: missing
    type: multi-select
    prompt: Which missing details would let someone repeat the run and trace the wrong links?
    choices:
      - { id: identities, text: "The IDs of the two affected settlements" }
      - { id: snapshot, text: "The version or checksum of the old test data copy" }
      - { id: run, text: "The command used to run the migration and the run ID" }
      - { id: expected, text: "The invoice links expected from before the migration" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results show the rule that failed?
    choices:
      - { id: printed, text: "The dashboard should keep the same invoice order. Instead, it shows the newest rows first." }
      - { id: links, text: "ST-7 should keep INV-40 and ST-8 should keep INV-41. Instead, the database swaps their links." }
      - { id: amounts, text: "The invoices should keep the same combined total. Instead, their new amounts differ from the originals." }
      - { id: dropped, text: "Both invoices should move to the new database. Instead, the migration deletes one original invoice." }
reference:
  severity: s1
  priority: p0
  component: mapper
  title: precise
  steps: [load, baseline, migrate, compare]
  missing: [snapshot, run]
  expected: links
decoy:
  severity: s3
  priority: p1
  component: filters
  title: precise
  steps: [load, baseline, migrate, compare]
  missing: [run, identities]
  expected: links
---

> The row counts match. Each recorded settlement now points to the other settlement's invoice.

The test used billing build 1003 in an isolated staging environment. Staging is a test copy of the live setup. A migration moves the data to a new database. Each settlement is a payment record that points to an invoice. The original data shows `ST-7 -> INV-40` and `ST-8 -> INV-41`.

The new database shows `ST-7 -> INV-41` and `ST-8 -> INV-40`. The invoice amounts and counts both match. The trial run screenshot shows success. The migration must keep the link for each settlement ID.

The cutover, or switch to the new setup, is tomorrow. The team has not moved the live data yet. A checksum is a value that helps identify the exact copy of the test data.

Severity tells how serious the bug is:

- S1: The stored settlement links are wrong.
- S2: A required task is blocked. The stored data stays correct.
- S3: The display or a secondary report is wrong. The stored links stay correct.
- S4: Only the appearance is wrong.

Priority tells when to fix it:

- P0: If any stored value differs from what it should be, block the cutover.
- P1: If a reporting issue leaves work possible, fix it before the first finance report.
- P2: Fix appearance issues during maintenance.
