---
title: List each active employee and their manager
kind: sql
topic: joins
difficulty: easy
minutes: 7
roles: [manual-qa, automation]
schema: |
  CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    employee_name TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(employee_id),
    is_active INTEGER NOT NULL CHECK (is_active IN (0, 1))
  );
seed: |
  INSERT INTO employees VALUES
    (1, 'Mara', NULL, 0), (2, 'Dev', 1, 1),
    (3, 'Jules', 2, 1), (4, 'Nia', 1, 0), (5, 'Noel', 2, 1);
alteredSeed: |
  INSERT INTO employees VALUES
    (30, 'Mika', NULL, 1), (31, 'Bo', NULL, 0), (32, 'Lee', 31, 1),
    (33, 'Mika', 30, 1), (34, 'Mina', NULL, 1), (35, 'Asha', 33, 0), (36, 'Oren', 34, 1);
reference:
  query: |
    SELECT e.employee_id, e.employee_name, m.employee_name AS manager_name
    FROM employees e
    LEFT JOIN employees m ON m.employee_id = e.manager_id
    WHERE e.is_active = 1
    ORDER BY e.employee_id;
decoy:
  query: |
    SELECT e.employee_id, e.employee_name, m.employee_name AS manager_name
    FROM employees e
    JOIN employees m ON m.employee_id = e.manager_id
    WHERE e.is_active = 1
    ORDER BY e.employee_id;
---

The staff directory needs one row for each active employee. Include the name of their direct manager, the person they report to. If the manager is inactive, still include their name. If the employee has no manager, return `NULL` for the name.

Return `employee_id`, `employee_name`, and `manager_name` in that order. Sort by `employee_id` in ascending order.
