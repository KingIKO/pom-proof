---
problem: sql/department-salary-coverage
---

Count the salary column after a left join from departments. `COUNT(e.salary_cents)` counts each non-`NULL` salary, including zero and repeated amounts. Because the department is on the left, the report can show a count of zero for a department with no employees.

```sql
SELECT d.department_id, COUNT(e.salary_cents) AS salaries_recorded
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id;
```

The visible counts are one for Billing, two for Returns, and one for Dispatch. `COUNT(*)` gives the same results because every department has at least one employee and every salary is present. That query counts a row with an unknown salary and even counts the single row supplied by the left join for an empty department. Counting `employee_id` would fix the empty department case but still count employees whose salary was missing.

An interviewer will look for the difference between the number of rows, the number of employees, and the number of populated salaries. Try one department with no employees and one with an employee whose salary is `NULL`. Both should return zero. In separate checks, two equal known salaries should count twice, and zero should count once.

See [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html).
