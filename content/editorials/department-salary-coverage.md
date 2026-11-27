---
problem: sql/department-salary-coverage
---

## What is going on

The payroll import check counts assigned employees with a recorded salary in each department. If a department has no employees, it still needs a row with a count of zero. The same rule applies if none of its employees have a recorded salary. A salary of zero counts as recorded.

## The fix

```sql
SELECT d.department_id, COUNT(e.salary_cents) AS salaries_recorded
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id;
```

1. Join `departments` to `employees` with a `LEFT JOIN` on `department_id`.

   **Why:** A `LEFT JOIN` keeps a department even when no employee matches it. An inner join keeps only matches, so it would omit Payroll, which has no employees in the altered data. If an employee's department ID is `NULL`, the value for missing information, they have no department to match. A recorded salary does not change that.

2. Group by `d.department_id`.

   **Why:** A department can match several employee rows. Grouping by the department ID puts all those rows together so the report can return one count. If departments share a name, their IDs still keep them separate.

3. Select `COUNT(e.salary_cents)` for each department.

   **Why:** The salary column holds `NULL` when an employee has no recorded salary. It also holds `NULL` in the row for a department with no employee match. `COUNT` on the salary column skips both. Mobile's recorded zero counts. Two employees with the same recorded amount still count twice.

## Why the tempting answer fails

The tempting query uses `COUNT(*)` to count every row after the join. In the visible data, Billing and Dispatch have one employee each. Returns has two. All four salaries are present, so counting rows gives the right counts.

In the altered data, the query counts Platform's one employee even though the salary is unknown. It also counts the row that the left join keeps for empty Payroll. Both counts should be zero. Counting `employee_id` would fix Payroll only. Platform would still have a count of one.

## What the interviewer listens for

Explain how counting every joined row differs from counting employees or recorded salaries. Test a department with no employees and one with only unknown salaries. Check that a salary of zero and a repeated salary both count as recorded values.

## Sources

- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite outer joins and grouping](https://www.sqlite.org/lang_select.html)
