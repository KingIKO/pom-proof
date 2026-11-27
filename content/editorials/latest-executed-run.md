---
problem: sql/latest-executed-run
---

## What is going on

The dashboard needs tests whose latest executed run failed. An executed run is one that passed or failed. A later skip leaves the last executed result unchanged. A later pass means the latest run did not fail, so keep passes in the set of runs the query can choose from.

## The fix

```sql
WITH ranked AS (
  SELECT case_id, outcome, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY seq DESC) AS position
  FROM runs WHERE outcome <> 'skipped'
)
SELECT cases.name AS name
FROM ranked JOIN cases ON cases.id = ranked.case_id
WHERE ranked.position = 1 AND ranked.outcome = 'failed'
ORDER BY cases.name;
```

1. Exclude skipped runs before you rank the results.

   **Why:** The `void order` case has a failure followed by a skip. The skip must never take first position. If a case has only a skip, as in `print invoice`, it has no executed run to rank.

2. Rank each case's runs newest first with `ROW_NUMBER()`, partitioned by `case_id` and ordered by `seq DESC`.

   **Why:** Each partition is a separate group containing one case's runs. The `ROW_NUMBER()` function numbers the runs in that group in the chosen order. The largest sequence value belongs to the newest run. The `seq` column has unique values, so there are no ties to break.

3. Use an inner join on the case ID to get the name from `cases`.

   **Why:** The dashboard needs each qualifying case's name. An inner join keeps only rows that match. A case with no executed run, such as `tracking` in the sample, has no ranked row to match. The dashboard should not display an empty entry for that case.

4. Keep position one only if the outcome is `failed`.

   **Why:** The `amend order` case failed before it passed. If you filter out passes before ranking, the older failure looks like the latest result.

5. Sort the returned names by `cases.name`.

   **Why:** The window, which reads each case's runs in sequence order, helps choose its latest result. The dashboard lists the chosen case names alphabetically.

## Why the tempting answer fails

The tempting query ranks skips along with executed runs. In the visible sample, skips take first position for both `checkout` and `pickup`. The query returns no rows.

In the altered data, the query returns `switch address` because its last run failed. It misses `void order` because that case ends in a skip after a failure.

The correct query returns `checkout` and `pickup` in the sample. In each case, the failure is the latest executed run.

## What the interviewer listens for

Explain why the query removes skips before it ranks runs. Show why it checks for failure only after it picks the latest executed run. Test a skip after a failure and a pass after a failure.

## Sources

- [SQLite `ROW_NUMBER` and window ordering](https://www.sqlite.org/windowfunctions.html)
- [SQLite joins, filtering, and result ordering](https://www.sqlite.org/lang_select.html)
