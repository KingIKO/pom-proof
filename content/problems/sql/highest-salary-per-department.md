---
title: Find the highest earners in each department
kind: sql
topic: ranking
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT NOT NULL);
  CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    department_id INTEGER REFERENCES departments(department_id),
    employee_name TEXT NOT NULL,
    salary_cents INTEGER
  );
seed: |
  INSERT INTO departments VALUES (1, 'Platform'), (2, 'Delivery'), (3, 'Support');
  INSERT INTO employees VALUES
    (10, 1, 'Mara', 9600000), (11, 1, 'Dev', 9100000), (12, 1, 'Jules', NULL),
    (13, 2, 'Nia', 9600000), (14, 2, 'Reese', 8700000),
    (15, NULL, 'Noel', 12000000);
alteredSeed: |
  INSERT INTO departments VALUES (31, 'Support'), (32, 'Billing'), (33, 'Mobile'), (34, 'Growth');
  INSERT INTO employees VALUES
    (101, 31, 'Bo', 8750000), (102, 31, 'Rae', 8750000), (103, 31, 'Lee', 6300000),
    (104, 32, 'Mina', 7250000), (105, 32, 'Asha', NULL),
    (106, 33, 'Mika', NULL), (107, NULL, 'Oren', 15000000), (108, 32, 'Zia', 7200000);
reference:
  query: |
    WITH department_pay AS (
      SELECT department_id, MAX(salary_cents) AS top_salary
      FROM employees
      WHERE department_id IS NOT NULL
      GROUP BY department_id
    )
    SELECT d.department_id, d.department_name, e.employee_id, e.employee_name, e.salary_cents
    FROM department_pay p
    JOIN departments d ON d.department_id = p.department_id
    JOIN employees e ON e.department_id = p.department_id AND e.salary_cents = p.top_salary
    ORDER BY d.department_id, e.employee_id;
decoy:
  query: |
    SELECT d.department_id, d.department_name, e.employee_id, e.employee_name,
      MAX(e.salary_cents) AS salary_cents
    FROM departments d
    JOIN employees e ON e.department_id = d.department_id
    WHERE e.salary_cents IS NOT NULL
    GROUP BY d.department_id, d.department_name
    ORDER BY d.department_id, e.employee_id;
---

Check a department payroll report against the employee export. For each department with a known salary, find every employee whose known salary is the highest in that department. Omit unassigned employees and departments with no known salary. Include all ties.

Return `department_id`, `department_name`, `employee_id`, `employee_name`, `salary_cents`, in that column order. Sort by `department_id` ascending, then `employee_id` ascending.
