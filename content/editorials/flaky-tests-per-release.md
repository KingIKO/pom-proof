---
problem: sql/flaky-tests-per-release
---

## What is going on

The report flags a test when it fails and later passes in the same release. The result gives a team something to investigate. A deploy or a data fix between attempts could also explain the change in outcome.

## The fix

```sql
SELECT DISTINCT f.release_id, f.case_id, c.title AS case_title
FROM test_runs f
JOIN test_cases c ON c.case_id = f.case_id
WHERE f.outcome = 'failed' AND EXISTS (
  SELECT 1
  FROM test_runs p
  WHERE p.release_id = f.release_id AND p.case_id = f.case_id
    AND p.outcome = 'passed' AND p.run_id > f.run_id
)
ORDER BY f.release_id, f.case_id;
```

1. Start from `test_runs f` and filter for `f.outcome = 'failed'`.

   **Why:** A test with no failure has nothing to recover from. A skipped row cannot serve as the starting attempt either.

2. Inner join `test_cases` on `case_id` to retrieve the title.

   **Why:** The run carries the case ID and the case carries the title. Each run here belongs to one case, so there is no missing case row to preserve with a left join.

3. Use `EXISTS` to look for a pass with the same release and case IDs.

   **Why:** Draft return fails in R21 and passes in R22. Matching the case alone would mix those attempts; matching the release alone could borrow a pass from a different test.

4. Require the passing run's ID to be greater than the failed run's ID.

   **Why:** A pass before a failure cannot qualify. A skip between a failure and a later pass, as for Add card, leaves the evidence intact because the attempts need not be adjacent.

5. Select distinct release and case rows.

   **Why:** Two Track parcel failures in R22 both find later passes, but the report needs one R22 row for that case. Leaving out the run ID allows those rows to collapse into one.

6. Sort by release ID, then case ID.

   **Why:** Report rows for Track parcel in different releases appear with their own release. If multiple cases qualify in a release, case ID fixes their display order.

## Why the tempting answer fails

The decoy checks for both outcomes without comparing run IDs. On the visible data, Add card in R14 and Save address in R15 really do fail before passing. In the altered data, Cancel pickup passes first, then fails and is skipped. The decoy flags it even though there is no pass after the failure.

## What the interviewer listens for

Explain how you establish the direction of the outcome change and keep the report to one row per release and case. Test a pass in the wrong release and multiple passes after a failure.

## Sources

- [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator)
- [SQLite joins, `DISTINCT`, and ordering](https://www.sqlite.org/lang_select.html)
