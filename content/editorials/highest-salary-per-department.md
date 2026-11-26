---
problem: sql/highest-salary-per-department
---

Find each department's maximum salary, then join it back to employees in that department. Keep the department ID in both parts of the join so someone in another department with the same amount doesn't match.

```sql
WITH department_pay AS (
  SELECT department_id, MAX(salary_cents) AS top_salary
  FROM employees
  WHERE department_id IS NOT NULL
  GROUP BY department_id
)
SELECT d.department_id, d.department_name, e.employee_id, e.employee_name, e.salary_cents
FROM department_pay p
JOIN departments d ON d.department_id = p.department_id
JOIN employees e ON e.department_id = p.department_id AND e.salary_cents = p.top_salary
ORDER BY d.department_id, e.employee_id;
```

The grouped decoy selects one employee's details beside `MAX`. SQLite has a special rule for bare columns alongside a single built-in `MIN` or `MAX`. Those values come from an extremum row, but a tie can pick any tied row, and the group still returns just one row. That shortcut happens to return Mara and Nia on the visible data. Joining back returns one row per qualifying employee, so a department can have several highest earners. A department with only unknown salaries has a `NULL` maximum; salary equality makes no match for it.

In an interview, explain how the query changes the unit of output from a department to an employee. [PostgreSQL](https://www.postgresql.org/docs/current/sql-select.html#SQL-GROUPBY) and [MySQL with `ONLY_FULL_GROUP_BY`](https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html) reject the decoy's ungrouped employee columns in this example. The join avoids that portability problem.

See [bare columns in SQLite aggregate queries](https://www.sqlite.org/lang_select.html#bareagg).
