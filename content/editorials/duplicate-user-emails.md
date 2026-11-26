---
problem: sql/duplicate-user-emails
---

Apply `LOWER` to the grouping key, then return that key and the number of user rows it represents. Remove `NULL` addresses before grouping because the check is about recorded addresses. Keep only counts greater than one.

```sql
SELECT LOWER(email) AS normalized_email, COUNT(*) AS user_count
FROM users
WHERE email IS NOT NULL
GROUP BY LOWER(email)
HAVING COUNT(*) > 1
ORDER BY normalized_email;
```

The decoy lowercases the display value but groups by the raw column. Both queries find the duplicate `returns@example.test` on the visible seed, since its two copies use identical spelling and case. SQLite's default collation keeps upper- and lowercase variants in separate raw groups. Lowercasing the output after that decision cannot combine their counts. Grouping by the same expression being displayed makes the counting rule explicit.

An interviewer may ask whether the check should also trim spaces or remove address suffixes. This contract only folds ASCII case; applying any other rule could merge records that the application treats as distinct. SQLite's built-in `LOWER` handles ASCII. [PostgreSQL's version](https://www.postgresql.org/docs/current/functions-string.html) follows the database locale, and [MySQL grouping](https://dev.mysql.com/doc/refman/8.4/en/case-sensitivity.html) can already ignore case depending on the column's collation. Match those settings to the required comparison before porting a data check.

See [SQLite `LOWER`](https://www.sqlite.org/lang_corefunc.html#lower) and [collation rules](https://www.sqlite.org/datatype3.html#collation).
