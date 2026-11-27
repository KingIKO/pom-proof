---
problem: sql/second-highest-salary
---

## What is going on

The report is about the second distinct salary and everyone who earns it. Two employees can share the top amount, and several can also share the next amount. Missing salaries do not form a pay level.

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

   **Why:** If everyone with recorded pay earns the same amount, the query must return nothing. Letting unknown salaries take part could give them a rank despite there being only one known amount.

2. Apply `DENSE_RANK()` ordered by salary descending, with no ID in the window order.

   **Why:** The two top earners in the altered data both get rank one, and the next amount gets rank two. `RANK()` would skip rank two after two first-place rows. Including employee ID in the window would split equal salaries.

3. Keep every row with `pay_rank = 2`.

   **Why:** Bo and Lee each earn the second distinct amount. Both need an employee row, so the rank filter must never reduce a tie to one record.

4. Order the selected rows by `employee_id`.

   **Why:** The ID gives employees on identical pay a fixed display order after the ranks have been assigned.

## Why the tempting answer fails

`LIMIT 1 OFFSET 1` skips the first employee. It returns Dev on the visible data because the first two salary amounts each belong to one person. In the altered data, the second employee, Mika, is still on the top salary. Even if the offset reached the next pay level, the limit would drop one of its two earners.

## What the interviewer listens for

Explain why the window order defines pay ties and why the display order can use an ID. The same ranking pattern works in PostgreSQL and MySQL 8.

## Sources

- [SQLite window functions](https://www.sqlite.org/windowfunctions.html)
- [SQLite `ORDER BY`, `LIMIT`, and `OFFSET`](https://www.sqlite.org/lang_select.html)
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/functions-window.html)
- [MySQL window functions](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html)
