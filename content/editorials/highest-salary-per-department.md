---
problem: sql/highest-salary-per-department
---

## What is going on

The payroll report needs every employee who shares their department's highest known salary. The department maximum is one value. There can be several employees to display for that value.

## The fix

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

1. Exclude employees with a `NULL` department ID from `department_pay`.

   **Why:** Oren has a high salary but no department in the altered rows. A group of unassigned employees represents no department the report can list.

2. Group the remaining employees by `department_id` and take `MAX(salary_cents)`.

   **Why:** Billing needs a maximum based only on salaries in Billing. `MAX` ignores unknown salaries and returns `NULL` if the group has no known pay, as with Mobile.

3. Inner join the grouped rows to `departments` by ID.

   **Why:** The department row supplies its name. An empty department like Growth has no grouped employee row, and the report has no winners to display for it.

4. Inner join employees on both department ID and the maximum salary.

   **Why:** Mara and Nia earn the same amount in different departments; matching on salary alone could attach either to the wrong department. Matching both keys returns every tied earner. A `NULL` maximum cannot equal an employee salary, so Mobile has no result row.

5. Sort by department ID, then employee ID.

   **Why:** The two Support earners have equal salaries. Their IDs order the tied rows without changing who qualifies.

## Why the tempting answer fails

The decoy selects employee details beside `MAX`. When a grouped query uses a single built-in `MIN` or `MAX`, SQLite takes bare column values from rows with that minimum or maximum. Here `MAX` gives Mara and Nia on the visible data. The query still returns only one row per group and can pick either tied employee. In the altered data, Support needs both Bo and Rae. PostgreSQL and MySQL with `ONLY_FULL_GROUP_BY` reject these ungrouped employee columns; the join-back query avoids that portability issue.

## What the interviewer listens for

Describe how the query finds one maximum per department and then returns one row per qualifying employee. Explain why both keys matter when different departments pay the same amount.

## Sources

- [Bare columns in SQLite aggregate queries](https://www.sqlite.org/lang_select.html#bareagg)
- [SQLite `MAX`](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite joins and ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL `GROUP BY`](https://www.postgresql.org/docs/current/sql-select.html#SQL-GROUPBY)
- [MySQL `GROUP BY` handling](https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html)
