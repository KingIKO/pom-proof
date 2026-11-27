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

Find the departments with an empty roster, meaning no employees are assigned to them. An employee whose department ID is `NULL` has no department and appears on no roster. More than one department can have the same name.

Return `department_id` first and `department_name` second. The rows can appear in any order.
