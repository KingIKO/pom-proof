---
problem: sql/duplicate-audit-events
---

## What is going on

An audit import can store the same event twice under different IDs. The report defines a copy by the user, action, and timestamp. System events can have no user and still repeat.

## The fix

```sql
SELECT user_id, action, occurred_at, COUNT(*) AS copies
FROM audit_events
GROUP BY user_id, action, occurred_at
HAVING COUNT(*) > 1;
```

1. Group by `user_id`, `action`, and `occurred_at`, leaving out `event_id`.

   **Why:** Two users can save a profile at the same instant, and one user can save it twice one second apart. Both cases produce distinct fingerprints. Including the unique event ID would also split exact copies that should stick together.

2. Select the fingerprint and count the group with `COUNT(*)`.

   **Why:** SQLite groups `NULL` user IDs together when the other key fields match. Two system exports recorded at one timestamp contribute two rows; `COUNT(user_id)` would give that group zero.

3. Apply `HAVING COUNT(*) > 1` to keep only repeated fingerprints.

   **Why:** A lone event is valid, even if the same user did the same thing at a different time. The group count exists after grouping, where `HAVING` can filter on it. The count includes the first copy.

## Why the tempting answer fails

The decoy groups by user and action and shows the earliest timestamp with `MIN`. Every visible user and action pair has only one timestamp, so it reports the right counts there. In the altered data, user 31 saves a profile at 11:00:00 and again at 11:00:01. The decoy calls those two copies of the earlier event. Taking the minimum cannot recover distinctions that the grouping already erased.

## What the interviewer listens for

Explain which fields identify a stored row and which fields identify a duplicate for this report. Test both user and timestamp changes independently, plus repeated system events that have no user ID.

## Sources

- [SQLite grouping and filtering](https://www.sqlite.org/lang_select.html)
- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
