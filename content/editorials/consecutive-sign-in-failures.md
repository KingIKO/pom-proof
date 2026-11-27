---
problem: sql/consecutive-sign-in-failures
---

## What is going on

A consecutive failure is a failed sign-in whose preceding sign-in also failed. The audit log interleaves people and actions, so the immediately preceding log row can tell the wrong story.

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

1. Filter the window input to `action = 'sign_in'`, keeping both outcomes.

   **Why:** A profile save between two failures must leave the streak intact. A successful sign-in between them must break it, so that row needs to reach the window.

2. Partition `LAG(outcome)` by `user_id`.

   **Why:** Adjacent failures in the log can belong to different users. Each user's first sign-in has no previous attempt, so its lagged value is `NULL`.

3. Order the window by `occurred_at`, then `event_id`.

   **Why:** Events 105 and 106 share a timestamp in the altered data. The lower ID goes first, giving event 106 a failed predecessor.

4. In the outer query, require both the current and previous outcomes to be `failed`.

   **Why:** After three failures in a row, the first has no failed predecessor and both later attempts qualify. A success after a failure must stay out of the result.

5. Sort the output by `user_id`, then `event_id`.

   **Why:** The report lists each user's flagged IDs in ascending order. The window's ordering decides which attempt came before another; it leaves output order to this clause.

## Why the tempting answer fails

The decoy discards successes before `LAG`. It still returns only event 14 on the visible data: the profile save does not count and the success follows the pair. In the altered data, dropping success 103 makes failed event 101 look like the predecessor of failed event 105. Event 105 should be the start of a new streak.

## What the interviewer listens for

Explain which rows are allowed to break a streak and which are invisible to it. The same `LAG` approach works in PostgreSQL and MySQL 8.

## Sources

- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite filtering and output ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/functions-window.html)
- [MySQL window functions](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html)
