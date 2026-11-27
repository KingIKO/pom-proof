---
problem: sql/employee-manager-directory
---

## What is going on

The same table holds each employee and their direct manager. The active flag records whether an employee is active. Only active employees get a directory row. If an active employee has no manager, the manager name should be `NULL`, the SQL value for missing information.

## The fix

```sql
SELECT e.employee_id, e.employee_name, m.employee_name AS manager_name
FROM employees e
LEFT JOIN employees m ON m.employee_id = e.manager_id
WHERE e.is_active = 1
ORDER BY e.employee_id;
```

1. Match `e.manager_id` to `m.employee_id` using the two references to `employees`.

   **Why:** The aliases `e` and `m` give the same table two short names, one for each role. Jules reports to Dev. Dev reports to Mara. The match from `e` follows just one link, from Jules to Dev. A match by name could pick the wrong employee because two employees are named Mika.

2. Use a `LEFT JOIN` from the employee to the manager.

   **Why:** The altered data has an active Mika with no manager ID. An inner join keeps only matching rows, so it would omit that Mika. A `LEFT JOIN` keeps the employee even without a match and returns `NULL` for the manager name.

3. Apply `e.is_active = 1` to the directory entry only.

   **Why:** Lee is active, so the directory needs Lee's row. Bo is Lee's manager even though Bo is inactive. Filtering out the inactive `m` row would lose Bo's name.

4. Select the name from each role: `e.employee_name` for the employee and `m.employee_name` for the manager.

   **Why:** A person can appear in either role. Dev's name goes in the employee column on Dev's row. It goes in the manager column on Jules's row.

5. Sort by `e.employee_id`.

   **Why:** The directory shows both employees named Mika. The employee ID puts their rows in a fixed order even when their names match.

## Why the tempting answer fails

The tempting query uses an inner join. Dev, Jules, and Noel are the active employees in the visible data. They all have managers, so the inner join keeps every one of their rows.

In the altered data, Mika and Mina are active and have no managers. Both should appear with `NULL` manager names. The inner join drops their rows because there is no manager to match.

## What the interviewer listens for

Explain which copy of the table supplies the employee and which supplies the manager. Test a manager who reports to another manager. A self-join matches a table to itself. PostgreSQL and MySQL support the same self-join syntax.

## Sources

- [SQLite join documentation](https://www.sqlite.org/lang_select.html)
- [PostgreSQL `SELECT`](https://www.postgresql.org/docs/current/sql-select.html)
- [MySQL join syntax](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/join.html)
