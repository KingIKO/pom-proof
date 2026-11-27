---
title: Find everyone paid the next salary below the highest
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

The payroll export has a row for each employee. A salary of `NULL` means the amount is unknown. When ranking known salaries, count each **distinct** amount once, even if several employees earn it. If there are fewer than two different amounts, return no rows. Otherwise, report every employee who earns the second-highest amount.

Return `employee_id`, `employee_name`, and `salary_cents` in that order. Sort by `employee_id` in ascending order.
