---
problem: sql/customer-running-spend
---

## What is going on

Each paid order gets its customer's running spend as of that order. A single total per customer would lose the order-by-order increases, and two orders placed in the same second still have separate running totals.

## The fix

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

1. Filter to `status = 'paid'` before calculating the window.

   **Why:** A pending order for 9,000 cents at the same timestamp as paid orders would inflate later totals if it entered the sum, even if the report hid its own row.

2. Partition `SUM(total_cents)` by `customer_id`.

   **Why:** Two customers can pay at the same time, and neither balance should include the other customer's order. The window keeps one output row per paid order.

3. Order each customer's window by `placed_at`, then `order_id`.

   **Why:** Order 111 was placed before order 103 despite its greater ID. For orders 103 and 107, the timestamp ties, so 103 comes first and receives its own increment before 107 contributes.

4. Specify `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.

   **Why:** The sum starts at the customer's first paid order and stops at the current row. The explicit frame states that rule directly. The unique order ID makes the full sort key unique here, so there are no peers even under the default frame.

5. Sort the result by customer, timestamp, and order ID.

   **Why:** Each customer's orders read in the sequence used for the calculation. Sorting the displayed rows cannot fix a running total that already included a later order.

## Why the tempting answer fails

The decoy orders the window by timestamp alone. The simultaneous visible payments belong to different customers, so there are no peers within a partition. In the altered rows, order 103 should show 1,600 cents. The default `RANGE` frame includes same-time order 107 as a peer and gives both 4,700.

## What the interviewer listens for

Explain what the sort keys decide and which rows the frame sums. MySQL 8 and PostgreSQL support the same syntax and also use a peer-inclusive default for an ordered window.

## Sources

- [SQLite window frame rules](https://www.sqlite.org/windowfunctions.html#framespec)
- [SQLite filtering and output ordering](https://www.sqlite.org/lang_select.html)
- [MySQL window frames](https://dev.mysql.com/doc/refman/8.4/en/window-functions-frames.html)
- [PostgreSQL window function calls](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS)
