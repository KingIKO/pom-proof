---
title: Find paid orders placed in March
kind: sql
topic: date-time
difficulty: easy
minutes: 5
roles: [manual-qa, automation]
schema: |
  CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    placed_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
    total_cents INTEGER NOT NULL
  );
seed: |
  INSERT INTO orders VALUES
    (1, '2026-03-01 08:45:00', 'paid', 3200), (2, '2026-03-10 12:30:00', 'pending', 1100),
    (3, '2026-03-24 16:10:00', 'paid', 2750), (4, '2026-04-02 09:00:00', 'paid', 6500),
    (5, NULL, 'paid', 1600);
alteredSeed: |
  INSERT INTO orders VALUES
    (31, '2026-02-28 23:59:59', 'paid', 2000), (32, '2026-03-01 00:00:00', 'paid', 3000),
    (33, '2026-03-31 00:00:00', 'paid', 4000), (34, '2026-03-31 23:59:59', 'paid', 5300),
    (35, '2026-04-01 00:00:00', 'paid', 6000), (36, '2026-03-31 14:30:00', 'cancelled', 7000),
    (37, NULL, 'paid', 9000), (38, '2025-03-15 12:00:00', 'paid', 4900);
reference:
  query: |
    SELECT order_id, placed_at, total_cents
    FROM orders
    WHERE status = 'paid'
      AND placed_at >= '2026-03-01 00:00:00'
      AND placed_at < '2026-04-01 00:00:00';
decoy:
  query: |
    SELECT order_id, placed_at, total_cents
    FROM orders
    WHERE status = 'paid' AND placed_at BETWEEN '2026-03-01' AND '2026-03-31';
---

Reconcile a monthly export for paid orders placed in March 2026, UTC. `placed_at` is either `NULL` or `YYYY-MM-DD HH:MM:SS` text in UTC. Include the full month, from the start of March 1 through the end of March 31. Exclude missing timestamps and orders whose status is not `paid`.

Return `order_id`, `placed_at`, `total_cents`, in that column order. Row order does not matter.
