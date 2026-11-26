---
problem: sql/consecutive-sign-in-failures
---

Build the sign-in sequence before filtering for failures. Within a user's sequence, `LAG(outcome)` reads the previous attempt's outcome. Once both outcomes are available, keep rows where the current and previous values both indicate a failure.

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

On the visible data, event 14 is the only match. The profile save is outside the sequence, and the subsequent success comes after the pair. The decoy discards successes before calling `LAG`, so it also finds that match. In a failure, success, failure sequence, the decoy would join the two failures into an apparent streak. The success must remain visible to the window so it can break the streak.

For a follow-up, trace what three failures in a row produce. The first has no preceding failure, and both later attempts qualify. Include a same-second pair to check the ID tie-break as well. Compare that with two consecutive log entries belonging to different users, which must never form a streak. PostgreSQL and MySQL 8 support the same `LAG` approach.

See [SQLite window functions](https://www.sqlite.org/windowfunctions.html).
