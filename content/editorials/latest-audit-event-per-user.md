---
problem: sql/latest-audit-event-per-user
---

## What is going on

The audit summary has room for one event per user. Two events can have the same timestamp, and an older backfilled event can have a greater ID. Users with no history still get a summary row.

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

1. Use `ROW_NUMBER()` partitioned by `user_id`.

   **Why:** Users 32 and 34 have events at the same time in the altered data. Each user needs a separate sequence and a separate winner.

2. Order the window by `occurred_at DESC`, then `event_id DESC`.

   **Why:** For user 31, 103 wins over 102 because their timestamps tie. Event 111 has a greater ID than either but occurred earlier, so it loses on the first key.

3. Left join from `users` by user ID and require `r.position = 1` in `ON`.

   **Why:** User 33 has no event and needs `NULL` in each event field. An inner join would drop that user. A `WHERE r.position = 1` would also drop the `NULL`-extended row after a left join.

4. Sort the result by `u.user_id`.

   **Why:** The window sort chooses an event. The outer sort puts all users in report order, including those without timestamps to sort by.

## Why the tempting answer fails

The decoy joins on each user's maximum timestamp. Users with history in the visible data each have a unique latest timestamp, so it returns events 12 and 14 and still includes user 3 with no event. In the altered data, two events share user 31's latest timestamp. Both match the decoy join, which breaks the one-row-per-user rule.

## What the interviewer listens for

Explain where the tie is resolved and where users with no events are preserved. PostgreSQL and MySQL 8 support the same window function and left join.

## Sources

- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite join behavior and ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/functions-window.html)
- [PostgreSQL `SELECT`](https://www.postgresql.org/docs/current/sql-select.html)
- [MySQL window functions](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html)
- [MySQL join syntax](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/join.html)
