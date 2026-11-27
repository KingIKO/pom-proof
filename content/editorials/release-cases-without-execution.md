---
problem: sql/release-cases-without-execution
---

## What is going on

The report finds planned tests that were never executed in their release. A planned test is a release and case pair listed in `release_cases`. A case can pass in another release and still be missing from this one. This is a coverage check, which asks whether each planned test ran at all. So a failed run counts as an execution.

## The fix

```sql
SELECT p.release_id, p.case_id
FROM release_cases p
WHERE NOT EXISTS (
  SELECT 1
  FROM test_runs t
  WHERE t.case_id = p.case_id AND t.release_id = p.release_id
    AND t.outcome IN ('passed', 'failed')
);
```

1. Select the release and case IDs from `release_cases`.

   **Why:** Only a planned pair can have a gap. Track parcel ran in R23, but it was not planned there. So that run cannot add a row to the report.

2. Match both `case_id` and `release_id` in the subquery.

   **Why:** A subquery is a query nested inside another query. Cancel pickup was skipped in R21 and passed in R22. That R22 pass cannot satisfy the plan for R21. A pass for another case in R21 cannot satisfy it either.

3. Limit the match to `passed` or `failed` runs.

   **Why:** A skip leaves coverage missing, even though the test runner wrote a row for it. A failure, such as Void refund in the sample, is enough to show that the test was executed.

4. Use `NOT EXISTS` to keep a planned pair only when no executed run matches it.

   **Why:** `NOT EXISTS` is true when the subquery finds no rows. Track parcel in R21 has a failure and a retry that passed. One match is already enough to exclude that pair. A second match does not change the decision, so the query does not need to count matches.

## Why the tempting answer fails

The decoy matches only the case ID. Each visible gap happens to have no executions in any release, so the decoy reports those gaps correctly. In the altered rows, the R22 pass for Cancel pickup hides the gap in R21. The R23 pass for Read invoice hides another gap in R21. Coverage from one release has leaked into another release.

## What the interviewer listens for

Name both parts of the report key, the release and the case. Explain why a skip cannot satisfy the subquery. If you write an equivalent left join instead, filter for executed outcomes in the `ON` clause. Then test for a missing run ID.

## Sources

- [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator)
- [SQLite outer joins](https://www.sqlite.org/lang_select.html)
