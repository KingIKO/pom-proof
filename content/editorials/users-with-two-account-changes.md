---
problem: sql/users-with-two-account-changes
---

## What is going on

The audit needs users who changed both their email and their password. The two changes can happen in either order. Repeated changes of one kind add to the history. They do not make up for a missing change of the other kind.

## The fix

```sql
SELECT user_id
FROM audit_events
WHERE action IN ('email_changed', 'password_changed')
GROUP BY user_id
HAVING COUNT(DISTINCT action) = 2;
```

1. Keep only `email_changed` and `password_changed` events.

   **Why:** In the visible sample, user 2 changed their email and signed in. If sign-ins reached the count, that user would seem to have two kinds of activity. Yet user 2 has no password change.

2. Group by `user_id` and return that key.

   **Why:** An email change by one user and a password change by another cannot make either person qualify. Grouping also returns one row for each qualifying user's whole history, not one row per event.

3. Count the distinct actions within each user group.

   **Why:** A distinct count counts each different value only once. User 31's two email changes add one type. User 32's repeated password change also adds one type, and their email change adds the second.

4. Require the distinct count to equal two in `HAVING`.

   **Why:** After the filter, only the two required actions are left. So a count of two proves that both exist. `HAVING` checks each group after grouping. The condition belongs there because no single row can prove that a user made both changes.

## Why the tempting answer fails

The decoy counts event rows with `COUNT(*) >= 2`. In the visible data, each user has at most one of each relevant type. So the decoy correctly returns only user 1. In the altered data, user 31 changed their email twice, and user 33 changed their password twice. Both users reach the row count without meeting the account audit rule.

## What the interviewer listens for

Explain how the filter and the distinct count work together. Two correlated `EXISTS` checks can express the same rule without grouping. Each check looks for one of the two actions by the same user. A correlated check is a subquery that refers to the row the outer query is checking.

## Sources

- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite grouping and `HAVING`](https://www.sqlite.org/lang_select.html)
- [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator)
