---
problem: scenario/data-migration-ci-gates
---

Agree on the invoice and settlement invariants, which interruptions the migration supports, and which results CI must produce. A total count is a weak oracle. A missing invoice can cancel out a duplicate, and even the exact IDs and amounts cannot catch a settlement linked to the wrong invoice.

Spend ten minutes on interruption and resume, and eight on normal reconciliation against the untouched snapshot. Save the legacy expectations before running the candidate on separate copies. Compare exact IDs, amounts, and settlement links, then issue approval only if the required results are present. The decoy trades reconciliation for screenshots, where swapped relationships can be invisible. A swapped link blocks approval even if counts and totals agree.

Put the pure conversion cases in a unit table for fast feedback. The candidate gate uses the staging API to interrupt and resume the real fixture migration, then reads the stored evidence. If GitHub Actions is used, make the required result check that its test ran; a skipped job can report success. See [GitHub's status check reference](https://docs.github.com/en/pull-requests/reference/status-checks).

An interviewer listens for an explicit approval condition and a migration rehearsal that can detect silent corruption.
