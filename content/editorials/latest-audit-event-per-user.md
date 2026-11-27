---
problem: sql/latest-audit-event-per-user
---

## What is going on

The audit summary has room for one event per user. Two events can share a timestamp, or recorded time. An older backfilled event, one added to the log after the fact, can have a higher ID. A user with no events still gets a summary row.

## The fix

```sql
WITH ranked AS (
  SELECT user_id, event_id, action, occurred_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at DESC, event_id DESC) AS position
  FROM audit_events
)
SELECT u.user_id, r.event_id, r.action, r.occurred_at
FROM users u LEFT JOIN ranked r ON r.user_id = u.user_id AND r.position = 1
ORDER BY u.user_id;
```

1. Number each user's events separately with `ROW_NUMBER()` partitioned by `user_id`.

   **Why:** Partitioning puts each user's events in a separate group. The `ROW_NUMBER()` function assigns a position to each row in that group. Users 32 and 34 have events at the same time in the altered data. They each need an event in the first position.

2. Order the window by `occurred_at DESC`, with `event_id DESC` to break ties.

   **Why:** The window sets the rows `ROW_NUMBER()` sees for each user and the order it sees them in. The `DESC` keyword sorts the latest times and highest IDs first. For user 31, events 103 and 102 share a timestamp, so event 103 goes first. Event 111 has a greater ID than either, but its earlier timestamp places it after both.

3. Left join from `users` by user ID, with `r.position = 1` in the `ON` clause.

   **Why:** User 33 has no event, so the row needs a missing value, `NULL`, in each event field. A left join keeps the user even without a match. An inner join would drop that user because it keeps only matches. The `r.position = 1` rule belongs in `ON`, which decides what counts as a match. A `WHERE r.position = 1` filter would drop user 33's row after the join because the position is `NULL`.

4. Sort the result by `u.user_id`.

   **Why:** The window sort chooses an event for each user. The final sort orders the report by user ID. That includes users without any event times to sort by.

## Why the tempting answer fails

The tempting query matches on each user's latest timestamp. In the visible data, each user with events has just one event at their latest time. The query returns events 12 and 14. It still includes user 3, who has no event.

In the altered data, two events share user 31's latest timestamp. Both match the join. The report then includes user 31 twice, even though it needs one row per user.

## What the interviewer listens for

Show where the query picks one event when two timestamps match. Explain which part keeps users without events. PostgreSQL and MySQL 8 support the same window function and left join.

## Sources

- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite join behavior and ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/functions-window.html)
- [PostgreSQL `SELECT`](https://www.postgresql.org/docs/current/sql-select.html)
- [MySQL window functions](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html)
- [MySQL join syntax](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/join.html)
