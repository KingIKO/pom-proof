---
problem: sql/duplicate-audit-events
---

Group by the entire fingerprint and keep groups with more than one row. Count the rows in each group with `COUNT(*)` so events without a user still contribute. SQLite treats `NULL` values as equal for grouping, as the report requires.

```sql
SELECT user_id, action, occurred_at, COUNT(*) AS copies
FROM audit_events
GROUP BY user_id, action, occurred_at
HAVING COUNT(*) > 1;
```

The decoy uses the earliest timestamp as a label for a group built from only the user and action. Each user and action pair in the visible data has just one timestamp, so the decoy happens to match. A user can save a profile twice a second apart. Those are separate fingerprints, even though they share the action and user. Taking `MIN` cannot restore the distinction once the timestamps have been grouped together.

In an interview, explain why `event_id` is absent from the grouping key. It distinguishes inserted rows, while the report looks for matching event details across rows. Check both different users at the same time and the same user at different times. Also include a repeated system event with no user to confirm that `COUNT(user_id)` would undercount it.

See [SQLite grouping and filtering](https://www.sqlite.org/lang_select.html) and [aggregate functions](https://www.sqlite.org/lang_aggfunc.html).
