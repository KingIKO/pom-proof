---
title: Find employees on the second-highest salary
kind: sql
topic: ranking
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    employee_name TEXT NOT NULL,
    salary_cents INTEGER
  );
seed: |
  INSERT INTO employees VALUES
    (1, 'Mara', 9100000), (2, 'Dev', 8550000),
    (3, 'Jules', 8000000), (4, 'Nia', NULL), (5, 'Noel', 8000000);
alteredSeed: |
  INSERT INTO employees VALUES
    (21, 'Asha', 12000000), (22, 'Mika', 12000000),
    (23, 'Bo', 9750000), (24, 'Lee', 9750000),
    (25, 'Mina', NULL), (26, 'Oren', 7400000), (27, 'Rae', 7100000);
reference:
  query: |
    WITH ranked AS (
      SELECT employee_id, employee_name, salary_cents,
        DENSE_RANK() OVER (ORDER BY salary_cents DESC) AS pay_rank
      FROM employees
      WHERE salary_cents IS NOT NULL
    )
    SELECT employee_id, employee_name, salary_cents
    FROM ranked
    WHERE pay_rank = 2
    ORDER BY employee_id;
decoy:
  query: |
    SELECT employee_id, employee_name, salary_cents
    FROM employees
    WHERE salary_cents IS NOT NULL
    ORDER BY salary_cents DESC, employee_id
    LIMIT 1 OFFSET 1;
---

A payroll export has a row for each employee. Missing salaries are `NULL`. Find every employee paid the second-highest **distinct** known salary. If fewer than two distinct salaries are known, return no rows.

Return `employee_id`, `employee_name`, `salary_cents`, in that column order. Sort by `employee_id` ascending.
