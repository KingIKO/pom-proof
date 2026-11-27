---
problem: sql/duplicate-user-emails
---

## What is going on

The account import ignores ASCII letter case throughout an email address. That means it treats uppercase A–Z and lowercase a–z as the same letters. It leaves everything else in the address as written. The report flags an address if more than one account uses it under that rule. Missing addresses cannot tell us whether two accounts share an address.

## The fix

```sql
SELECT LOWER(email) AS normalized_email, COUNT(*) AS user_count
FROM users
WHERE email IS NOT NULL
GROUP BY LOWER(email)
HAVING COUNT(*) > 1
ORDER BY normalized_email;
```

1. Drop rows with `NULL` email values before grouping the addresses.

   **Why:** SQLite uses `NULL` for a missing value. If you keep the two users without addresses, they form a group of two. The report would mistake that group for a shared address.

2. Use `LOWER(email)` as both the grouping value and the displayed address.

   **Why:** SQLite's built-in `LOWER` changes ASCII uppercase letters to lowercase. That applies to both the part before `@` and the domain, the part after it. All three addresses belong in one group: `Lee@example.test`, `lee@EXAMPLE.test`, and `LEE@example.test`.

3. Count user rows with `COUNT(*)`.

   **Why:** Each of the three Lee users belongs to the same group. The report counts all three users. Two users who spell their address the same way still count once each.

4. Keep groups with `HAVING COUNT(*) > 1`.

   **Why:** An address that appears once must stay out, even if it looks like a shared one. For example, the report should leave out `Sami@example.test`. The `HAVING` clause tests the count after SQL groups the rows.

5. Sort by `normalized_email`.

   **Why:** The `normalized_email` column holds the lowercase address readers see. Sorting by that column puts the rows in a predictable order even when the original spellings differ.

## Why the tempting answer fails

The tempting query groups by the original `email` values. It lowercases the addresses only when it displays them. The two visible copies of `returns@example.test` have identical case, so the query finds them.

A collation is a rule the database uses to compare text. SQLite's default collation keeps the `Lee` variants in the altered data in separate groups. Each group is too small to qualify. Lowercasing the output cannot combine the counts after the query calculates them.

## What the interviewer listens for

Name the comparison rule before you write the query. Trimming spaces or removing suffixes could merge addresses the import treats as distinct.

If you use a different database, check its comparison rules. PostgreSQL's `LOWER` follows the database locale, which sets language rules for operations such as changing case. MySQL can already ignore case when it groups rows, depending on its collation.

## Sources

- [SQLite `LOWER`](https://www.sqlite.org/lang_corefunc.html#lower)
- [SQLite collation rules](https://www.sqlite.org/datatype3.html#collation)
- [SQLite grouping and sorting](https://www.sqlite.org/lang_select.html)
- [SQLite `COUNT`](https://www.sqlite.org/lang_aggfunc.html)
- [PostgreSQL string functions](https://www.postgresql.org/docs/current/functions-string.html)
- [MySQL case sensitivity](https://dev.mysql.com/doc/refman/8.4/en/case-sensitivity.html)
