---
problem: sql/departments-without-employees
---

Begin with the departments because the result describes departments, including ones for which the employee export has no rows. A left join keeps those departments and puts `NULL` in the employee columns where there is no match.

```sql
SELECT d.department_id, d.department_name
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
WHERE e.employee_id IS NULL;
```

Test the employee primary key, which cannot be `NULL` in an actual employee row here. A nullable attribute would be a weaker test: a department with a matched employee could look empty if that attribute happened to be unknown. On the visible seed, only Content and Mobile have no matches.

The `NOT IN` answer works when the subquery has no `NULL` keys. Once an unassigned employee appears, an ID with no exact match compares as unknown against that list and fails the `WHERE` filter. `NOT EXISTS` with an employee-to-department equality is another way to ask the same question without that problem. An interviewer will look for a fixture with both an unassigned employee and an empty department. Those rows test different sides of the join and should coexist.

See the [SQLite join rules](https://www.sqlite.org/lang_select.html) and [`IN` result matrix](https://www.sqlite.org/lang_expr.html#the_in_and_not_in_operators).
