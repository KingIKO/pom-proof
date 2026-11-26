/*
  Practice datasets for the SQL lab. Each seed is plain SQLite. Data includes
  the traps interviewers like: NULLs, ties, duplicate emails, rows with no
  match on the other side of a join, and a self-referencing manager column.
*/

export interface Dataset {
  id: string;
  name: string;
  description: string;
  seed: string;
}

const company = `
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, location TEXT);
INSERT INTO departments VALUES
 (1,'Engineering','Austin'),(2,'Quality','Austin'),(3,'Sales','New York'),
 (4,'Support','Remote'),(5,'Legal','New York');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, department_id INTEGER,
  manager_id INTEGER, salary INTEGER, hired_on TEXT
);
INSERT INTO employees VALUES
 (1,'Maya Chen','maya.chen@corp.test',1,NULL,185000,'2018-03-12'),
 (2,'Luis Ortega','luis.ortega@corp.test',1,1,142000,'2019-07-01'),
 (3,'Priya Nair','priya.nair@corp.test',2,1,128000,'2020-01-15'),
 (4,'Tom Becker','tom.becker@corp.test',2,3,104000,'2021-05-20'),
 (5,'Aisha Bello','aisha.bello@corp.test',2,3,104000,'2022-02-07'),
 (6,'Jon Park','jon.park@corp.test',3,NULL,121000,'2017-11-30'),
 (7,'Elena Rossi','elena.rossi@corp.test',3,6,98000,'2023-04-03'),
 (8,'Sam Wright','sam.wright@corp.test',4,6,67000,'2021-09-13'),
 (9,'Noah Kim','noah.kim@corp.test',4,8,61000,'2024-01-08'),
 (10,'Grace Liu','maya.chen@corp.test',1,2,142000,'2022-10-17'),
 (11,'Omar Haddad',NULL,NULL,1,88000,'2025-06-02'),
 (12,'Ivy Turner','ivy.turner@corp.test',1,2,NULL,'2026-01-05');

CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER, budget INTEGER);
INSERT INTO projects VALUES
 (1,'Checkout rewrite',1,500000),(2,'Regression suite',2,120000),
 (3,'Mobile app',1,350000),(4,'CRM rollout',3,90000),(5,'Help center',4,NULL);

CREATE TABLE assignments (employee_id INTEGER, project_id INTEGER, hours INTEGER);
INSERT INTO assignments VALUES
 (1,1,120),(2,1,300),(2,3,80),(3,2,200),(4,2,160),(5,2,40),(5,1,60),
 (6,4,50),(7,4,140),(10,3,220),(3,1,30);
`;

const testops = `
CREATE TABLE releases (id INTEGER PRIMARY KEY, version TEXT NOT NULL, released_on TEXT);
INSERT INTO releases VALUES (1,'4.0.0','2026-08-04'),(2,'4.1.0','2026-09-01'),(3,'4.2.0','2026-10-06'),(4,'4.3.0',NULL);

CREATE TABLE test_cases (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, suite TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('P1','P2','P3')), automated INTEGER NOT NULL, owner TEXT
);
INSERT INTO test_cases VALUES
 (1,'Login with valid credentials','auth','P1',1,'priya'),
 (2,'Login locks after 5 failures','auth','P1',1,'priya'),
 (3,'Password reset email','auth','P2',0,'tom'),
 (4,'Add item to cart','checkout','P1',1,'aisha'),
 (5,'Apply discount code','checkout','P2',1,'aisha'),
 (6,'Pay with saved card','checkout','P1',1,'tom'),
 (7,'Guest checkout','checkout','P2',0,NULL),
 (8,'Search by keyword','search','P2',1,'priya'),
 (9,'Search with typo suggestion','search','P3',0,'tom'),
 (10,'Export orders to CSV','reports','P3',1,'aisha');

CREATE TABLE test_runs (
  id INTEGER PRIMARY KEY, test_case_id INTEGER NOT NULL, release_id INTEGER NOT NULL,
  status TEXT CHECK (status IN ('passed','failed','skipped')), duration_ms INTEGER, run_at TEXT
);
INSERT INTO test_runs VALUES
 (1,1,1,'passed',1200,'2026-08-01 09:00'),(2,2,1,'passed',3400,'2026-08-01 09:01'),
 (3,4,1,'failed',2100,'2026-08-01 09:03'),(4,4,1,'passed',2050,'2026-08-01 11:30'),
 (5,6,1,'passed',5100,'2026-08-01 09:05'),(6,8,1,'passed',900,'2026-08-01 09:07'),
 (7,1,2,'passed',1150,'2026-08-29 09:00'),(8,2,2,'failed',3600,'2026-08-29 09:01'),
 (9,2,2,'failed',3550,'2026-08-29 10:15'),(10,4,2,'passed',2000,'2026-08-29 09:03'),
 (11,5,2,'failed',1800,'2026-08-29 09:04'),(12,5,2,'passed',1750,'2026-08-29 12:00'),
 (13,6,2,'passed',5300,'2026-08-29 09:05'),(14,8,2,'skipped',NULL,'2026-08-29 09:07'),
 (15,10,2,'passed',7800,'2026-08-29 09:09'),
 (16,1,3,'passed',1180,'2026-10-02 09:00'),(17,2,3,'passed',3300,'2026-10-02 09:01'),
 (18,4,3,'failed',2300,'2026-10-02 09:03'),(19,4,3,'failed',2250,'2026-10-02 10:40'),
 (20,5,3,'passed',1700,'2026-10-02 09:04'),(21,6,3,'failed',9100,'2026-10-02 09:05'),
 (22,8,3,'passed',950,'2026-10-02 09:07'),(23,10,3,'passed',8200,'2026-10-02 09:09');

CREATE TABLE defects (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, severity TEXT CHECK (severity IN ('critical','major','minor','trivial')),
  status TEXT CHECK (status IN ('open','in_progress','fixed','wont_fix')), found_in_release INTEGER,
  test_case_id INTEGER, reported_by TEXT, created_on TEXT, closed_on TEXT
);
INSERT INTO defects VALUES
 (1,'Cart total ignores quantity','critical','fixed',1,4,'aisha','2026-08-01','2026-08-03'),
 (2,'Lockout counter resets on refresh','major','fixed',2,2,'priya','2026-08-29','2026-09-04'),
 (3,'Discount applied twice','major','fixed',2,5,'aisha','2026-08-29','2026-08-30'),
 (4,'Cart badge shows stale count','minor','open',3,4,'aisha','2026-10-02',NULL),
 (5,'Saved card payment times out','critical','in_progress',3,6,'tom','2026-10-02',NULL),
 (6,'Typo in reset email','trivial','wont_fix',2,3,'tom','2026-08-30','2026-09-02'),
 (7,'Search ignores accents','minor','open',3,NULL,'priya','2026-10-03',NULL),
 (8,'CSV export slow over 10k rows','major','open',3,10,'aisha','2026-10-04',NULL);
`;

const shop = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT, country TEXT, signed_up TEXT);
INSERT INTO customers VALUES
 (1,'Ada Lovelace','ada@mail.test','UK','2025-01-10'),
 (2,'Grace Hopper','grace@mail.test','US','2025-02-14'),
 (3,'Alan Turing','alan@mail.test','UK','2025-03-02'),
 (4,'Katherine Johnson','kj@mail.test','US','2025-05-21'),
 (5,'Linus Torvalds','linus@mail.test','FI','2025-07-30'),
 (6,'Margaret Hamilton','ada@mail.test','US','2025-09-09'),
 (7,'Tim Berners-Lee',NULL,'UK','2026-01-03');

CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, price REAL NOT NULL, stock INTEGER NOT NULL);
INSERT INTO products VALUES
 (1,'Mechanical keyboard','peripherals',129.0,14),(2,'USB-C hub','peripherals',49.5,0),
 (3,'27in monitor','displays',329.99,6),(4,'Laptop stand','accessories',39.0,40),
 (5,'Noise-cancelling headset','audio',199.0,3),(6,'Webcam','peripherals',89.0,11),
 (7,'Desk mat','accessories',19.99,120);

CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, ordered_at TEXT);
INSERT INTO orders VALUES
 (1,1,'delivered','2026-06-01'),(2,1,'delivered','2026-07-15'),(3,2,'shipped','2026-09-03'),
 (4,3,'cancelled','2026-09-10'),(5,4,'delivered','2026-09-18'),(6,2,'pending','2026-10-01'),
 (7,5,'delivered','2026-10-05'),(8,1,'pending','2026-10-20');

CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, unit_price REAL NOT NULL);
INSERT INTO order_items VALUES
 (1,1,1,129.0),(1,7,2,19.99),(2,3,1,329.99),(3,5,1,199.0),(3,4,2,39.0),
 (4,6,1,89.0),(5,1,1,119.0),(5,2,3,49.5),(6,7,1,19.99),(7,3,2,329.99),(8,4,1,39.0);
`;

export const DATASETS: Record<string, Dataset> = {
  company: {
    id: 'company',
    name: 'Company',
    description: 'Employees, departments, projects and assignments. The classic interview schema: salaries, managers and joins.',
    seed: company,
  },
  testops: {
    id: 'testops',
    name: 'Test operations',
    description: 'Test cases, test runs per release and defects. The data a QA team actually queries.',
    seed: testops,
  },
  shop: {
    id: 'shop',
    name: 'Shop',
    description: 'Customers, products, orders and order lines. Use it for aggregates, revenue and data-integrity checks.',
    seed: shop,
  },
};
