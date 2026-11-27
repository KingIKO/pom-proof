---
problem: sql/latest-executed-run
---

## What is going on

The results dashboard needs to show tests whose latest executed run failed. A later skip says nothing about whether a test recovered. A later pass does, so the query needs both passed and failed runs when it decides which execution was latest.

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

1. Exclude skipped runs from the rows that enter the window.

   **Why:** `void order` has a failure followed by a skip. The skip must never take the top position. A case with only a skip, such as `print invoice`, has no eligible row at all.

2. Partition `ROW_NUMBER()` by `case_id` and order by `seq DESC`.

   **Why:** One case's latest run says nothing about another's. The largest sequence value is the newest in each partition, and `seq` is unique, so the order needs no tie-break.

3. Inner join the ranked rows to `cases` by the case key.

   **Why:** The dashboard needs each qualifying case's name. Cases with no executed row, such as `tracking` in the sample, should not reappear as empty entries.

4. Keep position one only if the outcome is `failed`.

   **Why:** `amend order` failed before it passed. Filtering to failures before ranking would make that old failure look current.

5. Return the name and order by `cases.name`.

   **Why:** The window uses sequence to choose the latest result. The dashboard instead lists the selected case names alphabetically.

## Why the tempting answer fails

The decoy ranks skips along with executions. It already fails on the visible sample: skips occupy position one for both `checkout` and `pickup`, so the decoy returns no rows. In the altered data it returns `switch address`, which ends in a failure, but misses `void order`, which ends in a skip after a failure.

The reference returns `checkout` and `pickup` in the sample. Their failures are the latest executed runs for those cases.

## What the interviewer listens for

Explain why skipping is an input filter and failure is a filter on the chosen run. Check both a skip after a failure and a pass after a failure.

## Sources

- [SQLite `ROW_NUMBER` and window ordering](https://www.sqlite.org/windowfunctions.html)
- [SQLite joins, filtering, and result ordering](https://www.sqlite.org/lang_select.html)
