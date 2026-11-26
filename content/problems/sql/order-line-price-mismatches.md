---
title: Find order lines with a missing or different catalog price
kind: sql
topic: data-integrity
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
schema: |
  CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    current_price_cents INTEGER NOT NULL
  );
  CREATE TABLE orders (order_id INTEGER PRIMARY KEY);
  CREATE TABLE order_lines (
    line_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    unit_price_cents INTEGER
  );
seed: |
  INSERT INTO products VALUES (1, 4000), (2, 2500), (3, 0);
  INSERT INTO orders VALUES (11), (12);
  INSERT INTO order_lines VALUES (21, 11, 1, 4000), (22, 11, 2, 2000), (23, 12, 3, 0), (24, 12, 2, 2600);
alteredSeed: |
  INSERT INTO products VALUES (31, 5500), (32, 1800), (33, 0), (34, 1900);
  INSERT INTO orders VALUES (41), (42), (43);
  INSERT INTO order_lines VALUES
    (101, 41, 31, NULL), (102, 41, 32, 1800), (103, 42, 33, NULL),
    (104, 42, 34, 1800), (105, 43, 31, 5900), (106, 43, 33, 0);
reference:
  query: |
    SELECT l.order_id, l.line_id, l.unit_price_cents AS stored_price_cents,
      p.current_price_cents AS catalog_price_cents
    FROM order_lines l
    JOIN products p ON p.product_id = l.product_id
    WHERE l.unit_price_cents IS NOT p.current_price_cents
    ORDER BY l.order_id, l.line_id;
decoy:
  query: |
    SELECT l.order_id, l.line_id, l.unit_price_cents AS stored_price_cents,
      p.current_price_cents AS catalog_price_cents
    FROM order_lines l
    JOIN products p ON p.product_id = l.product_id
    WHERE l.unit_price_cents <> p.current_price_cents
    ORDER BY l.order_id, l.line_id;
---

In this checkout QA batch, the catalog is frozen and no discounts apply. Every order line points to an existing product and should copy its current price. Flag each line whose stored price differs from that product price or is `NULL`. A stored price of zero is valid when the product price is also zero.

Return `order_id`, `line_id`, `stored_price_cents`, `catalog_price_cents`, in that column order. Sort by `order_id` ascending, then `line_id` ascending.
