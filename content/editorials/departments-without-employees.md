---
problem: sql/departments-without-employees
---

## What is going on

A department's roster is empty when no employee points to its ID. The export can include unassigned employees and departments with the same name, so neither the number of employee rows nor the department name answers the roster check.

## The fix

```sql
SELECT d.department_id, d.department_name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
WHERE e.employee_id IS NULL;
```

1. Start with `departments` and `LEFT JOIN` employees using the department ID.

   **Why:** An inner join would remove every empty roster before the filter could find it. Joining on the ID keeps the two Payroll departments separate, and an employee with a `NULL` department ID matches neither.

2. Keep rows where `e.employee_id IS NULL`.

   **Why:** The employee primary key cannot be `NULL` in a real employee row in this schema. A missing key after the left join shows that there was no match. Testing an optional employee field instead could mark a staffed department as empty.

3. Return the ID and name from the department row.

   **Why:** The empty roster still has a department record. Showing the ID alongside the name lets a reader identify the correct department even if its name appears elsewhere.

## Why the tempting answer fails

The `NOT IN` decoy finds Content and Mobile on the visible data because every employee has a known department ID. The altered data includes an unassigned employee. For Returns and Platform, neither ID matches a value in the subquery, but the list contains `NULL`. `NOT IN` then yields unknown and `WHERE` drops both empty departments. A correlated `NOT EXISTS` testing department ID equality avoids that comparison against a list containing `NULL`.

## What the interviewer listens for

Explain why the left join and the primary-key check work together. Put an unassigned employee and an empty department in the same test so you exercise both sides of the comparison.

## Sources

- [SQLite join rules](https://www.sqlite.org/lang_select.html)
- [SQLite `IN` and `NOT IN` result matrix](https://www.sqlite.org/lang_expr.html#the_in_and_not_in_operators)
- [SQLite integer primary keys](https://www.sqlite.org/lang_createtable.html#rowids_and_the_integer_primary_key)
