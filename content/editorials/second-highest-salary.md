---
problem: sql/second-highest-salary
---

Rank the salary values and keep every employee whose salary has rank two. Remove missing salaries before ranking so the report only considers known pay.

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

The offset query returns the second employee in a sorted list. It returns Dev on the visible data because the two highest salary values each belong to one person. If two employees share the highest value, the second row still belongs to that top salary. If two employees share the second value, returning one row also loses a valid employee. `DENSE_RANK()` assigns equal pay the same rank and gives the next distinct value the next consecutive rank.

An interviewer may ask why `employee_id` appears only in the final sort. Adding it to the window sort would split tied salaries into separate ranks. The final sort can use the ID because ranking and presentation are separate decisions. A useful extra fixture has just one known salary shared by everyone: it should yield no rows. The same ranking pattern works in MySQL 8 and PostgreSQL.

See [SQLite window functions](https://www.sqlite.org/windowfunctions.html).
