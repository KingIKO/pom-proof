---
problem: sql/highest-salary-per-department
---

## What is going on

The payroll report needs every employee who earns their department's highest known salary. Each department with a known salary has one maximum, the largest known amount. Several employees in the same department can earn that amount.

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

1. Leave employees with a `NULL` department ID out of the `department_pay` result used by the main query.

   **Why:** A `NULL` department ID means the employee has no assigned department. For example, Oren earns a high salary but has no department in the altered data. The report has no department under which to list Oren or any other unassigned employee.

2. Find `MAX(salary_cents)` for each group of employees with the same `department_id`.

   **Why:** Grouping by department means Billing's maximum comes only from Billing salaries. The `MAX` function finds the largest known salary and skips unknown salaries. If a department has no known salary, as in Mobile, `MAX` returns `NULL`.

3. Use an inner join by ID to get the department name from `departments`.

   **Why:** An inner join keeps only matching rows. The matching row in `departments` supplies its name. If a department has no employees, as in Growth, there is no group to match. The report has no highest earners to show for Growth.

4. Match employees to their department's maximum using an inner join on both the department ID and salary.

   **Why:** Mara and Nia earn the same amount in different departments. If you match only the salary, an employee can appear under the wrong department. Matching both fields keeps every employee who ties for the highest salary in that department. A `NULL` maximum cannot equal an employee salary, so Mobile has no result row.

5. Sort by department ID, then employee ID.

   **Why:** The two top earners in Support have equal salaries. Sorting by employee ID fixes the order of their rows without changing who qualifies.

## Why the tempting answer fails

The tempting query selects employee details beside `MAX`. Those details are bare columns because the query neither groups by them nor passes them to a function that summarizes the group. If a grouped query uses one built-in `MIN` or `MAX`, SQLite takes bare column values from rows with that minimum or maximum. In the visible data, that rule gives Mara and Nia.

The tempting query returns only one row per department, so it can pick either employee in a tie. In the altered data, Support needs both Bo and Rae.

PostgreSQL rejects these ungrouped employee columns. MySQL rejects them with `ONLY_FULL_GROUP_BY` enabled. Joining the maximum back to the employee rows avoids that problem in both databases.

## What the interviewer listens for

Show how the query finds one maximum per department. Explain how it uses that value to return one row per qualifying employee. Give an example of two departments paying the same amount to show why the join needs both fields.

## Sources

- [Bare columns in SQLite aggregate queries](https://www.sqlite.org/lang_select.html#bareagg)
- [SQLite `MAX`](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite joins and ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL `GROUP BY`](https://www.postgresql.org/docs/current/sql-select.html#SQL-GROUPBY)
- [MySQL `GROUP BY` handling](https://dev.mysql.com/doc/refman/8.4/en/group-by-handling.html)
