---
problem: scenario/data-migration-ci-gates
---

## What is going on

The migration must preserve closed invoices and their settlement links after both a clean run and an interrupted run. A missing invoice can cancel out a duplicate in a count. Even matching IDs and amounts can hide a settlement linked to the wrong invoice.

## The answer

1. Agree which invoice IDs, amounts, and links must survive, where interruption and resume are supported, and which evidence CI must require.

   **Why:** CI can report success without proving the migration can resume at a supported point or preserve the relationships billing depends on.

2. Spend ten minutes interrupting and resuming a fixture migration and checking IDs, sums, and links. Spend eight reconciling an uninterrupted run per invoice against the untouched snapshot.

   **Why:** Resume can repeat or omit work even when the clean run works. Per-invoice reconciliation catches damaged relationships that counts and totals cannot.

3. Put pure legacy amount conversion in a unit table.

   **Why:** A failed row points straight to the conversion rule and gives fast feedback without running a migration.

4. Call the staging API to interrupt and resume the candidate, then read its status and stored results.

   **Why:** The control endpoint runs the actual resume path. Reading storage prevents a successful status from hiding incomplete or incorrect work.

5. Block approval if a settlement now points to a different invoice, even if counts and amounts match.

   **Why:** Billing would attribute the settlement to the wrong invoice.

6. Record expected evidence from the versioned legacy snapshot, run the candidate and interruption rehearsal on separate copies, reconcile both results, then approve only when the required checks ran and matched.

   **Why:** Untouched data provides an independent baseline and separate copies prevent the runs from contaminating each other. On GitHub Actions, a skipped job can report success, so the gate must establish that the required test ran.

## Why the tempting answer fails

Dashboard colors do not define a passing migration. Screenshots can miss swapped links. A UI test adds unrelated failure modes to the pure conversion and cannot replace control of the staging interruption or inspection of stored records. Approving before reconciliation lets the candidate pass without the checks that establish correctness.

## What the interviewer listens for

State exactly what evidence CI needs before approval. Explain how the rehearsal can detect silent data corruption.

## Sources

- [GitHub's status check reference](https://docs.github.com/en/pull-requests/reference/status-checks)
