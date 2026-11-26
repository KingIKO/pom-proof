---
problem: sql/customer-running-spend
---

Filter to paid orders before running the window. Partition by customer so each customer starts a separate sum. The window order follows the report's required sequence through the current order, including the order ID tie-break.

```sql
SELECT customer_id, order_id, placed_at,
  SUM(total_cents) OVER (
    PARTITION BY customer_id ORDER BY placed_at, order_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_paid_cents
FROM orders
WHERE status = 'paid'
ORDER BY customer_id, placed_at, order_id;
```

The decoy orders the window by timestamp alone. With the default `RANGE` frame, orders at the same timestamp within one customer share a running total that includes all those orders. The visible data has simultaneous paid activity across customers, where the partition already separates it, so the decoy agrees. If a customer has two paid orders at one time, the first should receive only its own increment. Sorting the final output cannot change a value already calculated by the window.

Two parts make the result repeatable: the order ID supplies a unique sequence inside each partition, and the explicit `ROWS` frame shows the intended row-by-row calculation. [MySQL 8](https://dev.mysql.com/doc/refman/8.4/en/window-functions-frames.html) and [PostgreSQL](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) support the same syntax and also default to a peer-inclusive frame when the window has an order.

See [SQLite window frame rules](https://www.sqlite.org/windowfunctions.html#framespec).
