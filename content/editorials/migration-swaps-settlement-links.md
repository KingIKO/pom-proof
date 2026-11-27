---
problem: bug-report/migration-swaps-settlement-links
---

## What is going on

The rehearsal is a trial run of the migration, which moves records into the new database. It reports success and preserves invoice counts and amounts. A settlement is a record that points to an invoice. In the new database, two settlements point to each other's invoices.

This happened on staging build 1003, before tomorrow's cutover. The cutover is the switch to the new database in production. No production migration has run.

## The answer

1. Assign S1 for persisted settlement link corruption.

   **Why:** Severity describes how much harm the defect causes. The total can still balance when both amounts are attributed to the wrong invoices. The incorrect links are persisted, which means they are stored in the new database.

2. Assign P0 and block the scheduled cutover.

   **Why:** Priority says how soon to fix the defect. The stated cutover policy blocks the cutover on any persisted mismatch. If the team waited for the first finance report, the bad relationships would reach production.

3. Route the report to invoice migration and settlement mapping.

   **Why:** The mapping is the step that pairs each settlement with its invoice. After the migration, the same IDs link to different invoices. That makes the mapping a better starting point than the report that happens to display it.

4. Choose a title that says the migration swapped two settlement links stored in the database.

   **Why:** The title identifies the data defect. It does not accuse anyone of using a particular join, a query step that combines tables.

5. Reproduce the changed links on a disposable copy of the legacy snapshot, a saved copy of the old data.

   Load the untouched snapshot in the isolated test environment and record its mappings. Apply the candidate migration to the disposable copy. Compare stored links for the same IDs.

   **Why:** The preserved baseline is the record of links before the migration. It lets you attribute any difference to the migration. Reading the new stored links supplies evidence that a generic success screenshot cannot.

6. Request the evidence needed to repeat and trace the rehearsal.

   Ask for the legacy snapshot version or checksum. Ask for the command that started the migration and its run ID.

   **Why:** A checksum is a short code computed from the data, so it identifies one exact snapshot. The invocation is the exact command that started the migration. Together these identify the input and the actual execution. An engineer can then reproduce the comparison and inspect the relevant run.

7. Record the expected and actual links from the rehearsal in the ticket.

   The links should stay the same: `ST-7` to `INV-40` and `ST-8` to `INV-41`. The new database instead shows `ST-7 -> INV-41` and `ST-8 -> INV-40`. Label this as a rehearsal result.

   **Why:** The counts and invoice amounts are the same before and after. The difference in each settlement-to-invoice pair still identifies exactly which preservation rule broke.

## Why the tempting answer fails

The decoy's S3, P1 and finance-report filters assume the stored relationships survived. The database comparison disproves that assumption. The run details are useful. The affected settlement IDs are already known, but the snapshot identity is missing.

Keep the decoy's title and steps. Use the same expected and actual links in the ticket.

## What the interviewer listens for

Name the rule for each settlement that the migration must preserve. Show why the aggregate checks, which compare only totals and counts, can pass while that rule fails.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
