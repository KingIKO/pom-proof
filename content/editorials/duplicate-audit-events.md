---
problem: sql/duplicate-audit-events
---

## What is going on

An audit import can store the same event twice under different IDs. The fingerprint is the set of values this report compares to decide whether two rows describe the same event. It uses the user, the action, and the timestamp, or recorded time. A system event can repeat even if it has no user.

## The fix

```sql
SELECT user_id, action, occurred_at, COUNT(*) AS copies
FROM audit_events
GROUP BY user_id, action, occurred_at
HAVING COUNT(*) > 1;
```

1. Group rows by `user_id`, `action`, and `occurred_at` only.

   **Why:** Two users can save a profile at the same instant and still have different fingerprints. One user who saves a profile twice one second apart also produces two fingerprints. If you include the unique `event_id` column, even exact copies of an event end up in separate groups.

2. Return each fingerprint with its row count from `COUNT(*)`.

   **Why:** If the action and timestamp match, SQLite groups rows with `NULL` user IDs together. Two system exports recorded at one timestamp contribute two rows. The `COUNT(user_id)` expression would give that group zero because it skips missing user IDs.

3. Keep only repeated fingerprints with `HAVING COUNT(*) > 1`.

   **Why:** An event that appears once is valid, even if the user did the same thing at another time. SQL counts the rows after grouping them. The `HAVING` clause can then filter whole groups by that count. The count includes the first copy.

## Why the tempting answer fails

The tempting query groups by user and action only. It uses `MIN` to show the earliest timestamp in each group. In the visible data, every user and action pair has only one timestamp. The query reports the right counts for those rows.

In the altered data, user 31 saves a profile at 11:00:00 and at 11:00:01. The query treats those events as two copies of the earlier event. Choosing the earlier time cannot split the rows back into separate groups.

## What the interviewer listens for

Explain which field identifies a stored row and which fields make up a fingerprint. Test what happens when only the user changes and when only the timestamp changes. Check that repeated system events can count even when they have no user ID.

## Sources

- [SQLite grouping and filtering](https://www.sqlite.org/lang_select.html)
- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
