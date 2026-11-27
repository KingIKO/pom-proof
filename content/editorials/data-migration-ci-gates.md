---
problem: scenario/data-migration-ci-gates
---

## What is going on

The migration must keep closed invoices and their settlement links intact. A settlement link ties a payment settlement to its invoice. Both must survive a clean run and a run that is interrupted and then resumed. In a count, a missing invoice can cancel out a duplicate. Even matching IDs and amounts can hide a settlement linked to the wrong invoice.

## The answer

1. Agree which invoice IDs, amounts, and links must survive, at which points interruption and resume are supported, and which evidence CI must require.

   **Why:** CI, the automated build and test pipeline, can report success without proving two things. One is that the migration can resume at a supported point. The other is that it keeps the links between records that billing depends on.

2. Spend ten minutes on an interrupted and resumed run and eight minutes on checking a clean run invoice by invoice.

   Interrupt and resume a migration on fixture data, the prepared test data. Then check invoice IDs, sums, and links. In the clean run, compare each invoice's ID, amount, and links with the untouched snapshot of the old data.

   **Why:** Resuming can repeat or skip work even when the clean run works. Checking each invoice catches damaged links that counts and totals cannot reveal.

3. Test the pure conversion of legacy amounts, the amounts in the old format, with a unit table.

   **Why:** A unit table lists fixed inputs and expected outputs. The conversion is pure, so its output depends only on its input. A failed row points straight to the conversion rule. It also gives fast feedback without running a migration.

4. Test interruption and recovery of the candidate migration through the staging API.

   Interrupt the migration and resume it. Then read its status and stored results.

   **Why:** The control endpoint runs the actual resume path. Reading storage keeps a success status from hiding incomplete or incorrect work.

5. If a settlement now points to a different invoice, block approval, even if counts and amounts match.

   **Why:** Billing would assign the settlement to the wrong invoice.

6. Base approval on both runs matching the expected evidence.

   Record that evidence from the versioned legacy snapshot. Run the candidate and the interruption rehearsal on separate copies. An interruption rehearsal stops and resumes the migration on purpose. Reconcile both results against the evidence. Approve only when the required checks ran and matched.

   **Why:** Untouched data gives an independent baseline that the candidate cannot change. Separate copies keep the two runs from contaminating each other. On GitHub Actions, a skipped job can report success. So the gate, the CI step that approves the candidate, must establish that the required test ran.

## Why the tempting answer fails

Dashboard colors do not define a passing migration. Screenshots can miss swapped links. A UI test adds unrelated ways to fail to the pure conversion check. It also cannot replace control of the staging interruption or inspection of stored records. If you approve before reconciliation, the candidate passes without the checks that establish it is correct.

## What the interviewer listens for

State exactly what evidence CI needs before approval. Explain how the rehearsal can detect silent data corruption, damage that raises no error.

## Sources

- [GitHub's status check reference](https://docs.github.com/en/pull-requests/reference/status-checks)
