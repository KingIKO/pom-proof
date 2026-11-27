---
problem: sql/employee-manager-directory
---

## What is going on

An employee and their direct manager live in the same table. The employee's active flag determines whether that employee appears. Their manager's name is extra information, and a missing manager should leave that field blank.

## The fix

```sql
SELECT e.employee_id, e.employee_name, m.employee_name AS manager_name
FROM employees e
LEFT JOIN employees m ON m.employee_id = e.manager_id
WHERE e.is_active = 1
ORDER BY e.employee_id;
```

1. Give `employees` two roles with aliases `e` and `m`. Match `e.manager_id` to `m.employee_id`.

   **Why:** Jules reports to Dev, who reports to Mara. Following the pointer from `e` goes one step up that chain. The two employees named Mika also show why joining by name would be ambiguous.

2. Use a `LEFT JOIN` from the employee to the manager.

   **Why:** The altered data has an active Mika with no manager ID. An inner join would lose that directory entry. The left join keeps Mika and returns `NULL` for the manager name.

3. Apply `e.is_active = 1` to the directory entry only.

   **Why:** Lee's manager Bo is inactive, but Lee is active and still needs Bo's name. Filtering the `m` row would lose valid manager information.

4. Select `e.employee_name` for the employee and `m.employee_name` for the manager.

   **Why:** A person can occupy either role. Dev's name is the directory entry on Dev's row, and the manager's name on Jules's row.

5. Sort by `e.employee_id`.

   **Why:** The directory shows both employees named Mika. Ordering by the employee key puts their rows in a fixed order even when their names match.

## Why the tempting answer fails

The decoy uses an inner join. The visible active employees, Dev, Jules, and Noel, all have managers, so nothing is lost. The altered data includes active employees Mika and Mina without managers. Both should appear with `NULL` manager names, but the inner join removes them.

## What the interviewer listens for

Explain the join direction and test it with a manager who is also somebody's report. PostgreSQL and MySQL support the same self-join syntax.

## Sources

- [SQLite join documentation](https://www.sqlite.org/lang_select.html)
- [PostgreSQL `SELECT`](https://www.postgresql.org/docs/current/sql-select.html)
- [MySQL join syntax](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/join.html)
