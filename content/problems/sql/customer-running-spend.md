---
title: Calculate running paid spend per customer
kind: sql
topic: reporting
difficulty: hard
minutes: 12
roles: [automation, sdet]
schema: |
  CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, customer_name TEXT NOT NULL);
  CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    placed_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
    total_cents INTEGER NOT NULL
  );
seed: |
  INSERT INTO customers VALUES (1, 'Dara'), (2, 'Noa'), (3, 'Sam');
  INSERT INTO orders VALUES
    (11, 1, '2026-02-03 08:00:00', 'paid', 1400), (12, 2, '2026-02-03 08:00:00', 'paid', 2100),
    (13, 1, '2026-02-05 12:30:00', 'cancelled', 2000), (14, 1, '2026-02-06 09:00:00', 'paid', 3500),
    (15, 2, '2026-02-07 13:15:00', 'paid', 500), (16, 3, '2026-02-08 12:00:00', 'pending', 1300);
alteredSeed: |
  INSERT INTO customers VALUES (31, 'Asha'), (32, 'Bo'), (33, 'Lee');
  INSERT INTO orders VALUES
    (107, 31, '2026-03-04 15:00:00', 'paid', 3100), (103, 31, '2026-03-04 15:00:00', 'paid', 1200),
    (111, 31, '2026-03-03 09:00:00', 'paid', 400), (101, 32, '2026-03-04 15:00:00', 'paid', 5200),
    (105, 31, '2026-03-04 15:00:00', 'pending', 9000), (102, 32, '2026-03-04 15:00:00', 'paid', 650),
    (109, 31, '2026-03-08 12:00:00', 'paid', 600), (110, 33, '2026-03-05 11:00:00', 'cancelled', 750);
reference:
  query: |
    SELECT customer_id, order_id, placed_at,
      SUM(total_cents) OVER (
        PARTITION BY customer_id ORDER BY placed_at, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS running_paid_cents
    FROM orders
    WHERE status = 'paid'
    ORDER BY customer_id, placed_at, order_id;
decoy:
  query: |
    SELECT customer_id, order_id, placed_at,
      SUM(total_cents) OVER (PARTITION BY customer_id ORDER BY placed_at) AS running_paid_cents
    FROM orders
    WHERE status = 'paid'
    ORDER BY customer_id, placed_at, order_id;
---

For each paid order, calculate that customer's cumulative paid spend through that order. The sequence within each customer is `placed_at` ascending, then `order_id` ascending for equal timestamps. Timestamps are UTC text in `YYYY-MM-DD HH:MM:SS` format. Exclude pending and cancelled orders from both the running total and the result.

Return `customer_id`, `order_id`, `placed_at`, `running_paid_cents`, in that column order. Sort by `customer_id` ascending, then `placed_at` ascending, then `order_id` ascending.
