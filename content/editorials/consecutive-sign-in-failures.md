---
problem: sql/consecutive-sign-in-failures
---

## What is going on

A consecutive sign-in failure has another failed sign-in right before it for the same user. The audit log records actions from many users. The previous row in that log may show another user's attempt or a different action.

## The fix

```sql
WITH sequenced AS (
  SELECT user_id, event_id, outcome,
    LAG(outcome) OVER (PARTITION BY user_id ORDER BY occurred_at, event_id) AS previous_outcome
  FROM audit_events
  WHERE action = 'sign_in'
)
SELECT user_id, event_id
FROM sequenced
WHERE outcome = 'failed' AND previous_outcome = 'failed'
ORDER BY user_id, event_id;
```

1. Keep all rows that match `action = 'sign_in'`.

   **Why:** A profile save between two failures leaves the streak intact. A successful sign-in between two failures breaks the streak. Both sign-in outcomes must reach the window function, which reads related rows without merging them.

2. Partition `LAG(outcome)` by `user_id` so each user's rows stay separate.

   **Why:** Two neighboring failures in the log can belong to different users. The `LAG(outcome)` function reads the previous outcome within the same partition, or group of rows. For a user's first sign-in, it returns `NULL` because there is no previous attempt.

3. Order the window from earliest to latest by `occurred_at`, with lower `event_id` values first at the same time.

   **Why:** Events 105 and 106 share a timestamp, or recorded time, in the altered data. Event 105 has the lower ID, so its failure comes right before event 106.

4. Require `failed` for both outcomes in the outer query, which reads the rows after sequencing.

   **Why:** If a streak has three failures, the first has no failed attempt right before it. Both later attempts qualify. A success after a failure stays out because only the previous attempt failed.

5. Sort the output by `user_id`, then `event_id`.

   **Why:** The report lists each user's flagged IDs in ascending order, from lowest to highest. The window order tells `LAG` which attempt came first. The final sort controls the order readers see.

## Why the tempting answer fails

The tempting query removes successes before `LAG` looks for the previous outcome. On the visible data, it still returns only event 14. The profile save does not count, and the success comes after the two failures.

In the altered data, the query drops the success at event 103. It then treats failure 101 as the attempt right before failure 105. Event 105 should start a new streak.

## What the interviewer listens for

Explain why a success breaks a streak and why actions other than sign-ins leave it alone. The same `LAG` approach works in PostgreSQL and MySQL 8.

## Sources

- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite filtering and output ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/functions-window.html)
- [MySQL window functions](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html)
