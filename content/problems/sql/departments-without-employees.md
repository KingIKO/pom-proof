---
title: Find departments with no employees
kind: sql
topic: joins
difficulty: easy
minutes: 6
roles: [manual-qa, automation]
schema: |
  CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT NOT NULL);
  CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    department_id INTEGER REFERENCES departments(department_id),
    employee_name TEXT NOT NULL
  );
seed: |
  INSERT INTO departments VALUES (1, 'Billing'), (2, 'Content'), (3, 'Dispatch'), (4, 'Mobile');
  INSERT INTO employees VALUES (10, 1, 'Mara'), (11, 3, 'Dev'), (12, 3, 'Jules');
alteredSeed: |
  INSERT INTO departments VALUES (31, 'Payroll'), (32, 'Returns'), (33, 'Platform'), (34, 'Payroll'), (35, 'Design');
  INSERT INTO employees VALUES
    (101, 31, 'Nia'), (102, 35, 'Bo'), (103, NULL, 'Asha'), (104, 35, 'Mina'), (105, 34, 'Lee');
reference:
  query: |
    SELECT d.department_id, d.department_name
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.department_id
    WHERE e.employee_id IS NULL;
decoy:
  query: |
    SELECT department_id, department_name
    FROM departments
    WHERE department_id NOT IN (SELECT department_id FROM employees);
---

Check which department records should show an empty roster. Include every department that has no employee assigned to it. An employee with a `NULL` department ID is unassigned and belongs to no roster. Department names can repeat.

Return `department_id`, `department_name`, in that column order. Row order does not matter.
