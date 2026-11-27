---
problem: sql/duplicate-user-emails
---

## What is going on

The account import treats ASCII case variants of an email address as the same address. The report should find two accounts that share an address under that rule. Missing addresses tell us nothing about whether two accounts share one.

## The fix

```sql
SELECT LOWER(email) AS normalized_email, COUNT(*) AS user_count
FROM users
WHERE email IS NOT NULL
GROUP BY LOWER(email)
HAVING COUNT(*) > 1
ORDER BY normalized_email;
```

1. Filter out `NULL` email values before grouping.

   **Why:** The two users without addresses would otherwise form a group of two, which would be mistaken for a shared address.

2. Group by `LOWER(email)` and display that same key.

   **Why:** SQLite's built-in `LOWER` folds ASCII case. `Lee@example.test`, `lee@EXAMPLE.test`, and `LEE@example.test` must contribute to one count, including differences in the domain.

3. Count user rows with `COUNT(*)`.

   **Why:** Each of the three Lee users belongs to the same group. The report needs a count of three users, even when two users give their address with identical spelling.

4. Keep groups with `HAVING COUNT(*) > 1`.

   **Why:** A lone address, such as `Sami@example.test`, must stay out even if it resembles a duplicated one. The count exists at the group level, where `HAVING` can use it.

5. Sort by `normalized_email`.

   **Why:** Groups with different original spellings appear in a predictable order by the exact address the report displays.

## Why the tempting answer fails

The decoy groups by raw `email` and lowercases only for display. The two visible copies of `returns@example.test` have identical case, so the decoy finds them. SQLite's default collation keeps the altered `Lee` variants in separate groups, each too small to qualify. Lowercasing the output cannot combine counts already computed.

## What the interviewer listens for

Name the comparison rule before writing the query. Trimming spaces or removing suffixes could merge addresses the import treats as distinct. When porting, check the comparison rules: PostgreSQL's `LOWER` follows the database locale, and MySQL grouping can already ignore case depending on collation.

## Sources

- [SQLite `LOWER`](https://www.sqlite.org/lang_corefunc.html#lower)
- [SQLite collation rules](https://www.sqlite.org/datatype3.html#collation)
- [SQLite grouping and sorting](https://www.sqlite.org/lang_select.html)
- [SQLite `COUNT`](https://www.sqlite.org/lang_aggfunc.html)
- [PostgreSQL string functions](https://www.postgresql.org/docs/current/functions-string.html)
- [MySQL case sensitivity](https://dev.mysql.com/doc/refman/8.4/en/case-sensitivity.html)
