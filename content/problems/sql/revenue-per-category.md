---
title: Add up sales by category without cancelled orders
kind: sql
topic: reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    current_price_cents INTEGER NOT NULL
  );
  CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('completed', 'shipped', 'cancelled'))
  );
  CREATE TABLE order_lines (
    line_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL
  );
seed: |
  INSERT INTO products VALUES (1, 'Lighting', 4000), (2, 'Hardware', 750), (3, 'Lighting', 2500), (4, 'Storage', 1600);
  INSERT INTO orders VALUES (11, 'completed'), (12, 'shipped'), (13, 'cancelled');
  INSERT INTO order_lines VALUES
    (21, 11, 1, 2, 4000), (22, 11, 2, 3, 750), (23, 12, 3, 1, 2500), (24, 13, 4, 4, 1600);
alteredSeed: |
  INSERT INTO products VALUES
    (31, 'Tools', 5500), (32, 'Tools', 900), (33, 'Storage', 4500),
    (34, 'Lighting', 3600), (35, 'Hardware', 700);
  INSERT INTO orders VALUES (41, 'shipped'), (42, 'completed'), (43, 'cancelled'), (44, 'completed');
  INSERT INTO order_lines VALUES
    (101, 41, 31, 2, 4400), (102, 41, 31, 1, 4400), (103, 42, 32, 2, 1200),
    (104, 42, 33, 3, 4500), (105, 43, 33, 1, 4100), (106, 43, 34, 1, 3600),
    (107, 44, 35, 1, 700);
reference:
  query: |
    SELECT p.category, SUM(l.quantity * l.unit_price_cents) AS revenue_cents
    FROM order_lines l
    JOIN orders o ON o.order_id = l.order_id
    JOIN products p ON p.product_id = l.product_id
    WHERE o.status <> 'cancelled'
    GROUP BY p.category;
decoy:
  query: |
    SELECT p.category, SUM(l.quantity * p.current_price_cents) AS revenue_cents
    FROM order_lines l
    JOIN orders o ON o.order_id = l.order_id
    JOIN products p ON p.product_id = l.product_id
    WHERE o.status <> 'cancelled'
    GROUP BY p.category;
---

Check the storefront's category revenue report against its orders. Leave out lines from cancelled orders. For each other line, multiply the quantity by the unit price, the price for one item stored on that line. All prices use the same currency.

Look up the product's current category and add the line's amount to it. If no lines count toward a category, leave that category out.

Return `category` first and `revenue_cents` second. Rows can appear in any order.
