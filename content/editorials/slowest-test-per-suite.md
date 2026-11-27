---
problem: sql/slowest-test-per-suite
---

## What is going on

The timing report lists the slowest measurements in each suite. One case can reach the same maximum in several attempts, and different cases can tie. Each qualifying run is evidence worth keeping.

## The fix

```sql
WITH ranked AS (
  SELECT c.suite, c.case_id, r.run_id, r.duration_ms,
    RANK() OVER (PARTITION BY c.suite ORDER BY r.duration_ms DESC) AS position
  FROM test_cases c JOIN test_runs r ON r.case_id = c.case_id
  WHERE r.duration_ms IS NOT NULL
)
SELECT suite, case_id, run_id, duration_ms
FROM ranked WHERE position = 1
ORDER BY suite, run_id;
```

1. Inner join `test_cases` and `test_runs` on `case_id`.

   **Why:** The case gives each run a suite. Cases without a run have no result to rank, so a left join is unnecessary. A case with multiple runs needs each run kept separate.

2. Filter out `NULL` durations before ranking.

   **Why:** The security suite in the altered data has no measurements. Giving its unmeasured run first place would manufacture a slowest result for the suite.

3. Partition by suite and apply `RANK()` ordered only by descending duration.

   **Why:** Billing and returns both reach 5,800 ms, but they compete only within their own suites. Within returns, the three runs at that duration share first place. Using `run_id` in the window sort would split that tie.

4. Filter for `position = 1`.

   **Why:** Both Print label runs at the maximum qualify, but its 2,600 ms run does not. Keeping every first-place row preserves repeated maxima from one case as well as ties across cases.

5. Sort by suite, then run ID.

   **Why:** Run IDs settle the display order within a suite without changing which runs shared first place.

## Why the tempting answer fails

`ROW_NUMBER()` with a run ID tie-break suits a report that wants one winner. It agrees on the visible rows because payments and delivery each have a unique slowest run, and search has no measurement. In the altered returns suite, it keeps run 101 but drops runs 102 and 103, even though all three reach the same maximum.

## What the interviewer listens for

Explain why runs are ranked individually. Test a maximum shared by repeated runs of one case and by a run from another case.

## Sources

- [SQLite ranking functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite joins, filters, and ordering](https://www.sqlite.org/lang_select.html)
