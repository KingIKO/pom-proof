---
problem: sql/department-salary-coverage
---

## What is going on

The payroll import check measures how many assigned employees have a salary on record. An empty department and a staffed department with no known salaries both need a row with a zero count. A recorded salary of zero still contributes to coverage.

## The fix

```sql
SELECT d.department_id, COUNT(e.salary_cents) AS salaries_recorded
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id;
```

1. Start from `departments` and `LEFT JOIN` employees on `department_id`.

   **Why:** An inner join would erase Payroll, which has no employees in the altered data. An unassigned employee with a `NULL` department ID cannot match a department, even if their salary is known.

2. Group by `d.department_id`.

   **Why:** One department can have several employee rows, but the report gives one count for that department. Using the key also keeps different departments separate if they share a name.

3. Select `COUNT(e.salary_cents)` for each department.

   **Why:** `COUNT` on the salary column ignores `NULL` from both an employee with an unknown salary and a department with no employee match. Mobile's recorded zero counts, and two employees with the same known amount still count twice.

## Why the tempting answer fails

The decoy uses `COUNT(*)`. On the visible rows, Billing has one employee, Returns has two, and Dispatch has one, and all four salaries are present. In the altered data it counts Platform's one unknown salary and also counts the placeholder row for empty Payroll. Both counts should be zero. Counting `employee_id` would fix Payroll only; Platform would still be counted as one.

## What the interviewer listens for

Distinguish the number of joined rows, the number of employees, and the number of recorded salaries. Test an empty department and a staffed department with only unknown salaries, then check that zero and a repeated amount are recorded values.

## Sources

- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite outer joins and grouping](https://www.sqlite.org/lang_select.html)
