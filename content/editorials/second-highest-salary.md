---
problem: sql/second-highest-salary
---

## What is going on

The report asks for the second distinct salary and everyone who earns it. A distinct salary is a separate amount, so equal salaries count once. Two employees can share the top amount. Several can also share the next amount. A missing salary does not form a pay level.

## The fix

```sql
WITH ranked AS (
  SELECT employee_id, employee_name, salary_cents,
    DENSE_RANK() OVER (ORDER BY salary_cents DESC) AS pay_rank
  FROM employees
  WHERE salary_cents IS NOT NULL
)
SELECT employee_id, employee_name, salary_cents
FROM ranked
WHERE pay_rank = 2
ORDER BY employee_id;
```

1. Filter out `NULL` salaries before calculating ranks.

   **Why:** `NULL` marks a missing salary. If everyone with recorded pay earns the same amount, the query must return nothing. If unknown salaries took part in the ranking, they could get a rank. That could happen even though there is only one known amount.

2. Apply `DENSE_RANK()` ordered by salary descending, with no ID in the window order.

   **Why:** `DENSE_RANK()` is a window function, which computes a value for each row from a set of related rows. It gives equal salaries the same rank and leaves no gaps between ranks. In the altered data, the two top earners both get rank one, and the next amount gets rank two. `RANK()` would skip rank two after two first-place rows. Adding employee ID to the window order would split equal salaries.

3. Keep every row with `pay_rank = 2`.

   **Why:** Bo and Lee both earn the second distinct amount. Each of them needs an employee row in the result. So the rank filter must never cut a tie down to one record.

4. Order the selected rows by `employee_id`.

   **Why:** The ranks are already assigned at this point. The ID then gives employees with identical pay a fixed display order.

## Why the tempting answer fails

`LIMIT 1 OFFSET 1` skips the first employee and returns the next one. On the visible data, it returns Dev, because each of the first two salary amounts belongs to one person. In the altered data, the second employee, Mika, still earns the top salary. Suppose the offset did reach the next pay level. The limit would still drop one of its two earners.

## What the interviewer listens for

Explain why the window order decides which salaries tie. Explain why the display order can use an ID. The same ranking pattern works in PostgreSQL and MySQL 8.

## Sources

- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite `ORDER BY`, `LIMIT`, and `OFFSET`](https://www.sqlite.org/lang_select.html)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/functions-window.html)
- [MySQL window functions](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html)
