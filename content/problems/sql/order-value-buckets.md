---
title: Assign orders to value buckets
kind: sql
topic: aggregation
difficulty: easy
minutes: 6
roles: [manual-qa, automation]
schema: |
  CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    total_cents INTEGER CHECK (total_cents >= 0)
  );
seed: |
  INSERT INTO orders VALUES (1, 2850), (2, 9100), (3, 23550), (4, NULL), (5, 0);
alteredSeed: |
  INSERT INTO orders VALUES (31, 4999), (32, 5000), (33, 5001), (34, 19999),
    (35, 20000), (36, 20001), (37, NULL), (38, 5000);
reference:
  query: |
    SELECT order_id,
      CASE
        WHEN total_cents IS NULL THEN 'unknown'
        WHEN total_cents < 5000 THEN 'small'
        WHEN total_cents < 20000 THEN 'standard'
        ELSE 'high'
      END AS value_bucket
    FROM orders;
decoy:
  query: |
    SELECT order_id,
      CASE
        WHEN total_cents IS NULL THEN 'unknown'
        WHEN total_cents <= 5000 THEN 'small'
        WHEN total_cents <= 20000 THEN 'standard'
        ELSE 'high'
      END AS value_bucket
    FROM orders;
---

Check the value label displayed for each order. A missing total is `unknown`. A known total under 5,000 cents is `small`, a total from 5,000 through 19,999 cents is `standard`, and a total of at least 20,000 cents is `high`. Include every order.

Return `order_id`, `value_bucket`, in that column order. Row order does not matter.
