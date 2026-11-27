---
title: Count employees with a recorded salary in each department
kind: sql
topic: aggregation
difficulty: easy
minutes: 6
roles: [manual-qa, automation]
schema: |
  CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT NOT NULL);
  CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    department_id INTEGER REFERENCES departments(department_id),
    salary_cents INTEGER
  );
seed: |
  INSERT INTO departments VALUES (1, 'Billing'), (2, 'Returns'), (3, 'Dispatch');
  INSERT INTO employees VALUES (10, 1, 9200000), (11, 2, 8600000), (12, 2, 8200000), (13, 3, 7700000);
alteredSeed: |
  INSERT INTO departments VALUES (31, 'Mobile'), (32, 'Platform'), (33, 'Payroll'), (34, 'Catalog');
  INSERT INTO employees VALUES
    (101, 31, 9000000), (102, 31, NULL), (103, 31, 0),
    (104, 32, NULL), (105, 34, 9600000), (106, 34, 9600000), (107, NULL, 7100000);
reference:
  query: |
    SELECT d.department_id, COUNT(e.salary_cents) AS salaries_recorded
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.department_id
    GROUP BY d.department_id;
decoy:
  query: |
    SELECT d.department_id, COUNT(*) AS salaries_recorded
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.department_id
    GROUP BY d.department_id;
---

Check the payroll import by counting employees with a recorded salary in each department. Count only employees assigned to that department. A salary of zero counts. A salary of `NULL` means no salary was recorded.

If a department has no employees or no recorded salaries, return a count of zero for it.

Return `department_id` first and `salaries_recorded` second. Rows can appear in any order.
