---
problem: bug-report/migration-swaps-settlement-links
---

## What is going on

The rehearsal reports success and preserves invoice counts and amounts. A read of the new database shows that two settlements point to each other's invoices. This happened on staging build 1003 before tomorrow's cutover; no production migration has run.

## The answer

1. Assign S1 for persisted settlement link corruption.

   **Why:** A balanced total can coexist with both amounts being attributed to the wrong invoices. The incorrect links are stored in the new database.

2. Assign P0 and block the scheduled cutover.

   **Why:** The stated cutover policy blocks on any persisted mismatch. Waiting for the first finance report would allow the bad relationships into production.

3. Route the report to invoice migration and settlement mapping.

   **Why:** The same IDs link to different invoices after the migration. That makes the mapping a better starting point than the report that happens to display it.

4. Use the title “Invoice migration swaps two persisted settlement links.”

   **Why:** It identifies the data defect without accusing anyone of using a particular join.

5. Load the legacy snapshot in isolation, record the untouched mappings, apply the candidate migration to a disposable copy, then compare stored links for the same IDs.

   **Why:** A preserved baseline makes it possible to attribute differences to the migration. Reading the new stored links supplies evidence that a generic success screenshot cannot.

6. Ask for the legacy snapshot version or checksum and the migration invocation and run ID.

   **Why:** These identify the input and the actual execution so an engineer can reproduce the comparison and inspect the relevant run.

7. State in the ticket that this is a rehearsal result: `ST-7` should retain `INV-40` and `ST-8` should retain `INV-41`; the new database shows `ST-7 -> INV-41` and `ST-8 -> INV-40`.

   **Why:** The pairwise difference identifies the broken preservation rule exactly, even with the same counts and invoice amounts.

## Why the tempting answer fails

S3, P1 and finance-report filters assume the stored relationships survived. The database comparison disproves that assumption. The run details are useful, but the affected settlement IDs are already known; the snapshot identity is missing. Keep the title and the steps, and use the same expected and actual links in the ticket.

## What the interviewer listens for

Name the per-settlement rule the migration must preserve. Demonstrate why the aggregate checks can pass while that rule fails.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
