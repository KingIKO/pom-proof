---
problem: sql/users-with-two-account-changes
---

## What is going on

The audit needs users who changed both their email and their password. The changes can happen in either order. Repeated changes of one kind add history, but they do not satisfy the other requirement.

## The fix

```sql
SELECT user_id
FROM audit_events
WHERE action IN ('email_changed', 'password_changed')
GROUP BY user_id
HAVING COUNT(DISTINCT action) = 2;
```

1. Keep only `email_changed` and `password_changed` events.

   **Why:** User 2 in the visible sample changed their email and signed in. If sign-ins reach the count, that user appears to have two kinds of activity despite having no password change.

2. Group by `user_id` and return that key.

   **Why:** An email change by one user and a password change by another cannot qualify either person. Grouping also returns one row for a qualifying user's whole history rather than one row per event.

3. Count the distinct actions within each user group.

   **Why:** User 31's two email changes contribute one type. User 32's repeated password change also contributes one type, and their email change adds the second.

4. Require the distinct count to equal two in `HAVING`.

   **Why:** With only the required actions left, reaching two proves that both exist. The condition belongs after grouping because no individual row can prove a user performed both changes.

## Why the tempting answer fails

The decoy counts event rows with `COUNT(*) >= 2`. On the visible data, users have at most one of each relevant type, so it correctly returns only user 1. In the altered data, user 31 changed their email twice and user 33 changed their password twice. Both meet the row threshold without meeting the account audit rule.

## What the interviewer listens for

Explain how the filter and distinct count work together. Two correlated `EXISTS` checks, one for each action for the same user, express the same rule without grouping.

## Sources

- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite grouping and `HAVING`](https://www.sqlite.org/lang_select.html)
- [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator)
