---
title: Report mislinked settlements after migration
kind: bug-report
topic: defect-reporting
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: severity
    type: single-choice
    prompt: Which severity follows the accounting impact scale below?
    choices:
      - { id: s1, text: "S1, invoice to settlement links are corrupted in persisted data" }
      - { id: s3, text: "S3, secondary report wrong while persisted relationships stay correct" }
      - { id: s4, text: "S4, visual presentation only" }
      - { id: s2, text: "S2, required task blocked without stored-data corruption" }
  - id: priority
    type: single-choice
    prompt: Which priority should the team attach to the cutover candidate?
    choices:
      - { id: p2, text: "P2, next maintenance window" }
      - { id: p1, text: "P1, proceed and repair before the first finance report" }
      - { id: p0, text: "P0, block the scheduled cutover" }
  - id: component
    type: single-choice
    prompt: Which component is the best starting point given the pre- and post-run records?
    choices:
      - { id: cards, text: "Billing dashboard rendering" }
      - { id: mapper, text: "Invoice migration and settlement mapping" }
      - { id: processors, text: "Live payment provider requests" }
      - { id: filters, text: "Finance report filters" }
  - id: title
    type: single-choice
    prompt: Which title names the observable defect?
    choices:
      - { id: blame, text: "Migration author joined on the wrong key again" }
      - { id: vague, text: "Migration results are wrong" }
      - { id: long, text: "Running the billing migration in staging on build 1003 keeps both fixture invoices and the same combined amount but changes which invoice entries settlement ST-7 and settlement ST-8 point to" }
      - { id: precise, text: "Invoice migration swaps two persisted settlement links" }
  - id: steps
    type: ordering
    prompt: Order the reproduction that compares the untouched and migrated relationships.
    choices:
      - { id: baseline, text: "Record invoice and settlement mappings from the untouched fixture snapshot." }
      - { id: compare, text: "Compare stored post-run links for the same settlement IDs with the baseline." }
      - { id: migrate, text: "Apply the candidate migration to a disposable copy of that snapshot." }
      - { id: load, text: "Load the legacy staging snapshot into the isolated test environment." }
  - id: missing
    type: multi-select
    prompt: Which missing artifacts would let an engineer rerun and trace the failed mapping?
    choices:
      - { id: identities, text: "The two affected settlement IDs" }
      - { id: snapshot, text: "Legacy fixture snapshot version or checksum" }
      - { id: run, text: "Migration invocation and run identifier" }
      - { id: expected, text: "Expected invoice links in the baseline" }
  - id: expected
    type: single-choice
    prompt: Which comparison captures the invariant that failed?
    choices:
      - { id: printed, text: "Expected the dashboard to show the same invoice order; actual rows display newest first." }
      - { id: links, text: "Expected ST-7 to retain INV-40 and ST-8 to retain INV-41; actual the stored links are reversed." }
      - { id: amounts, text: "Expected the same combined amount; actual the new amounts differ from the baseline." }
      - { id: dropped, text: "Expected two invoices to migrate; actual one source invoice is deleted." }
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

> The row counts match, but the posted settlements are attached to each other's invoices.

Isolated staging migration, billing build 1003. The baseline reads `ST-7 -> INV-40` and `ST-8 -> INV-41`. A read of the new database shows `ST-7 -> INV-41` and `ST-8 -> INV-40`. Both invoice amounts and counts match. The rehearsal screenshot shows success. The migration must preserve the link for each settlement ID. The cutover is tomorrow and no production migration has run.

Severity: S1 persisted settlement links corrupted; S2 required task blocked without stored-data corruption; S3 display or secondary report wrong with correct stored links; S4 visual only. Priority: P0 block cutover for any persisted mismatch; P1 repair nonblocking reporting issues before the first finance report; P2 appearance fixes in maintenance.
