---
problem: sql/release-cases-without-execution
---

## What is going on

The report checks which planned tests were never executed for their release. A case can run successfully elsewhere and still be missing in this release. A failure counts as execution because this is a coverage check.

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

   **Why:** Only a planned pair can have a gap. Track parcel ran in R23 but was not planned there, so that run cannot introduce a row in the report.

2. Match both `case_id` and `release_id` in the subquery.

   **Why:** Cancel pickup was skipped in R21 and passed in R22. That pass cannot satisfy R21's plan. A pass for another case in R21 cannot satisfy it either.

3. Limit the match to `passed` or `failed` runs.

   **Why:** A skip leaves coverage missing even though the runner wrote a row. A failure, such as Void refund in the sample, is enough to show that execution took place.

4. Use `NOT EXISTS` to keep a planned pair only when there is no matching executed row.

   **Why:** Track parcel in R21 has both a failure and a retry that passed. One match already excludes that pair, so counting a second match adds nothing to the decision.

## Why the tempting answer fails

The decoy matches only the case ID. Visible gaps happen to have no executions in any release, so it reports them correctly. In the altered rows, the R22 pass for Cancel pickup hides the R21 gap, and the R23 pass for Read invoice hides another R21 gap. Coverage from one release has leaked into another.

## What the interviewer listens for

Name both parts of the report key and explain why a skip cannot satisfy the subquery. With an equivalent left join, filter for executed outcomes in `ON` before testing for a missing run ID.

## Sources

- [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator)
- [SQLite outer joins](https://www.sqlite.org/lang_select.html)
