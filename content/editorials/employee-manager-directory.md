---
problem: sql/employee-manager-directory
---

Read `employees` twice under different aliases. The `e` row is the directory entry. The `m` row is the employee referenced by that entry's `manager_id`. The two aliases make it possible to choose names from both roles in the same row.

```sql
SELECT e.employee_id, e.employee_name, m.employee_name AS manager_name
FROM employees e
LEFT JOIN employees m ON m.employee_id = e.manager_id
WHERE e.is_active = 1
ORDER BY e.employee_id;
```

The inner join returns Dev, Jules, and Noel on the visible seed because those active employees all have managers. It drops an active employee with a missing manager ID instead of showing a blank manager field. Putting the active filter on `m` would introduce a separate bug. An active employee can report to an inactive manager, and the directory still needs that name.

An interviewer may ask how to test the direction of the join. Use a chain where a manager is also an active report, and check that each employee points one step up rather than down. Also include a manager and an employee with the same name. The join depends on IDs, so matching names should never create extra rows. The same self-join syntax works in PostgreSQL and MySQL.

See the [SQLite join documentation](https://www.sqlite.org/lang_select.html).
