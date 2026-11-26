---
problem: sql/latest-audit-event-per-user
---

Use `ROW_NUMBER()` to choose one event per user. Sort each user's events by timestamp descending and then by ID descending. A left join from users attaches the chosen event and preserves users whose event history is empty.

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

The decoy joins on the latest timestamp. The visible users with events each have a unique latest timestamp, so it chooses events 12 and 14 and leaves user 3 with no event. If two events share that timestamp for one user, both rows match the join. The requested tie-break compares event IDs only after comparing timestamps; an older backfilled event can have an even greater ID.

Explain the tie rule where selection happens: inside the window. The final sort controls only how the selected rows appear. Moving `r.position = 1` from `ON` into `WHERE` would drop users with no history. Include a user with no events in any test of the summary's one-row-per-user guarantee. MySQL 8 and PostgreSQL support the same window function and left join.

See [SQLite window functions](https://www.sqlite.org/windowfunctions.html) and [join behavior](https://www.sqlite.org/lang_select.html).
