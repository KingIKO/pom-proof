---
problem: sql/users-with-two-account-changes
---

Filter to the two relevant event types and count distinct types for each user. A count of two proves that both are present. Since the group belongs to one user, an email change by one user and a password change by another cannot combine to qualify.

```sql
SELECT user_id
FROM audit_events
WHERE action IN ('email_changed', 'password_changed')
GROUP BY user_id
HAVING COUNT(DISTINCT action) = 2;
```

The visible data returns only user 1. The decoy counts matching event rows and works because each visible user has at most one row per change type. If someone changes their email twice without changing their password, the decoy sees two rows and flags them. Counting distinct action values keeps the number at one for that user. A user with both types still qualifies even when either type repeats.

An interviewer may ask how to write the check without grouping. Two correlated `EXISTS` conditions, one for each required action, also express the rule. Retain the filter in the aggregate version. Without it, someone with an email change and a sign-in could appear to have the two required types.

See [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html) and [`EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator).
