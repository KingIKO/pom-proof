---
problem: sql/departments-without-employees
---

## What is going on

A department's roster is empty when no employee row points to its ID. The export can include employees with no department, so the number of employee rows cannot tell you which rosters are empty. Departments can share a name, so checking the name cannot identify the roster either.

## The fix

```sql
SELECT d.department_id, d.department_name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
WHERE e.employee_id IS NULL;
```

1. Use a `LEFT JOIN` from `departments` to employees on the department ID.

   **Why:** A left join keeps each department, even when there is no employee match. An inner join would remove those departments before the filter could find them. Joining on the ID keeps the two Payroll departments separate. An employee with a `NULL` department ID cannot match either.

2. Keep rows where `e.employee_id IS NULL`.

   **Why:** The employee primary key identifies the employee row, and this schema requires a value for each real row. A `NULL` key after the left join shows there was no match. An employee may leave an optional field blank, so checking that field could mark a staffed department as empty.

3. Return the ID and name from the department row.

   **Why:** A department record remains even if its roster is empty. The ID identifies the department when more than one department shares the same name.

## Why the tempting answer fails

In the visible data, every employee has a known department ID. The `NOT IN` decoy therefore finds Content and Mobile. The altered data has an unassigned employee, so the subquery, the inner query that lists employee department IDs, contains `NULL`. Neither Returns nor Platform has an ID in that list. But `NOT IN` returns unknown in this case, so `WHERE` drops both empty departments.

A correlated `NOT EXISTS` checks each department for an employee with the same department ID. That avoids comparing its ID to a list containing `NULL`.

## What the interviewer listens for

Explain how the left join works with the primary-key check to find empty rosters. Put an unassigned employee and an empty department in the same test to cover both sides of the comparison.

## Sources

- [SQLite join rules](https://www.sqlite.org/lang_select.html)
- [SQLite `IN` and `NOT IN` result matrix](https://www.sqlite.org/lang_expr.html#the_in_and_not_in_operators)
- [SQLite integer primary keys](https://www.sqlite.org/lang_createtable.html#rowids_and_the_integer_primary_key)
