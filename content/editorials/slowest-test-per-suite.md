---
problem: sql/slowest-test-per-suite
---

## What is going on

The timing report lists the slowest measured runs in each suite. A suite is a group of related test cases. One case can reach the same maximum time in several attempts. Different cases can also tie. Each run at the maximum is evidence worth keeping.

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

   **Why:** An inner join keeps only rows that match in both tables. The case tells you which suite each run belongs to. A case without a run has no result to rank, so a left join is unnecessary. A case with several runs needs each run kept as its own row.

2. Filter out `NULL` durations before ranking.

   **Why:** A `NULL` duration means the run has no recorded time. In the altered data, the security suite has no measurements. If its unmeasured run took first place, the report would invent a slowest result for that suite.

3. Rank the runs in each suite with `RANK()`, ordered only by descending duration.

   **Why:** `PARTITION BY` splits the rows into one group per suite, and ranking starts over in each group. Billing and returns both reach 5,800 ms (milliseconds), but each competes only within its own suite. `RANK()` gives tied rows the same rank, so the three returns runs at that duration share first place. Adding `run_id` to the window sort would split that tie.

4. Filter for `position = 1`.

   **Why:** Both Print label runs at the maximum qualify, but its 2,600 ms run does not. Keeping every first-place row keeps repeated maximums from one case. It also keeps ties between different cases.

5. Sort by suite, then run ID.

   **Why:** Within a suite, run IDs set the display order. Sorting does not change which runs shared first place.

## Why the tempting answer fails

`ROW_NUMBER()` numbers the rows without ties, and the decoy breaks ties by run ID. That fits a report that wants one winner per suite. It agrees with the reference on the visible rows. Payments and delivery each have a unique slowest run, and search has no measurement. In the altered returns suite, it keeps run 101 but drops runs 102 and 103, though all three reach the same maximum.

## What the interviewer listens for

Explain why the query ranks each run on its own. Test a maximum shared by repeated runs of one case and by a run from another case.

## Sources

- [SQLite ranking functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite joins, filters, and ordering](https://www.sqlite.org/lang_select.html)
