---
title: Find imported lines with no matching order or product
kind: sql
topic: data-integrity
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE orders (order_id INTEGER PRIMARY KEY);
  CREATE TABLE products (product_id INTEGER PRIMARY KEY);
  CREATE TABLE order_lines (
    line_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER
  );
seed: |
  INSERT INTO orders VALUES (11), (12);
  INSERT INTO products VALUES (21), (22);
  INSERT INTO order_lines VALUES (31, 11, 21), (32, 12, 22), (33, 98, 99), (34, 12, 21);
alteredSeed: |
  INSERT INTO orders VALUES (41), (42);
  INSERT INTO products VALUES (51), (52), (53);
  INSERT INTO order_lines VALUES
    (101, 41, 51), (102, 41, 81), (103, 82, 52),
    (104, 83, 84), (105, NULL, 53), (106, 42, NULL), (107, 42, 51);
reference:
  query: |
    SELECT l.line_id,
      CASE WHEN o.order_id IS NULL THEN 1 ELSE 0 END AS missing_order,
      CASE WHEN p.product_id IS NULL THEN 1 ELSE 0 END AS missing_product
    FROM order_lines l
    LEFT JOIN orders o ON o.order_id = l.order_id
    LEFT JOIN products p ON p.product_id = l.product_id
    WHERE o.order_id IS NULL OR p.product_id IS NULL
    ORDER BY l.line_id;
decoy:
  query: |
    SELECT l.line_id,
      CASE WHEN o.order_id IS NULL THEN 1 ELSE 0 END AS missing_order,
      CASE WHEN p.product_id IS NULL THEN 1 ELSE 0 END AS missing_product
    FROM order_lines l
    LEFT JOIN orders o ON o.order_id = l.order_id
    LEFT JOIN products p ON p.product_id = l.product_id
    WHERE o.order_id IS NULL AND p.product_id IS NULL
    ORDER BY l.line_id;
---

Check the order lines waiting to be imported. Do this before the import applies foreign keys, which enforce links to rows in other tables. If a line's order or its product is missing, include the line. A link is missing if its ID is `NULL` or if no row has that ID.

For each link, return `1` if it is missing or `0` if it is valid. Return `line_id`, `missing_order`, and `missing_product` in that order. Sort by `line_id` in ascending order.
