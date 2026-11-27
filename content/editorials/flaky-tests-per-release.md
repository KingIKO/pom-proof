---
problem: sql/flaky-tests-per-release
---

## What is going on

The report flags a test case when it fails and later passes in the same release. That pattern gives the team a case to investigate. A deploy, which puts a new build in use, could explain the change between attempts. A fix to the test data could also explain it.

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

1. Use `f.outcome = 'failed'` to pick starting attempts from `test_runs f`.

   **Why:** The report needs a failure before it can look for a later pass. A skipped attempt cannot count as that failure.

2. Use an inner join on `case_id` to get the title from `test_cases`.

   **Why:** The run stores the case ID. The case row stores the title. An inner join keeps only rows that match, and each run here belongs to one case. You do not need a left join, which would keep a run even without a matching case.

3. Use `EXISTS` to look for a passing run with the same release and case IDs.

   **Why:** The `EXISTS` check asks whether at least one matching row exists. Draft return fails in R21 and passes in R22. If you match only the case, those attempts in different releases can match. If you match only the release, a pass from another test can match.

4. Require the passing run's ID to be greater than the failed run's ID.

   **Why:** Larger run IDs mean later attempts. A pass before the failure does not qualify. The failure and pass do not need to be next to each other. For example, Add card has a skip between its failure and its later pass.

5. Keep one row per release and case with `DISTINCT`.

   **Why:** Two Track parcel failures in R22 both have later passes. The report needs one R22 row for that case. If you leave out the run ID, `DISTINCT` can remove the extra copy because the selected values match.

6. Sort by release ID, then case ID.

   **Why:** Track parcel can qualify in different releases. Sorting by release ID lists each result with the other cases in that release. If several cases qualify in a release, the case IDs set the order readers see.

## Why the tempting answer fails

The tempting query checks for both outcomes without comparing run IDs. In the visible data, Add card in R14 fails before it passes. Save address in R15 does the same. In the altered data, Cancel pickup passes first, then fails and is skipped. The query flags Cancel pickup even though no pass follows the failure.

## What the interviewer listens for

Explain how the run IDs show that the failure came first. Show how you keep one row per release and case. Test a pass in the wrong release. Test what happens when several passes follow a failure.

## Sources

- [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator)
- [SQLite joins, `DISTINCT`, and ordering](https://www.sqlite.org/lang_select.html)
