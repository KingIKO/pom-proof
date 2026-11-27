---
problem: sql/customer-running-spend
---

## What is going on

The report shows the running total for each paid order. That total adds what the customer paid for this order and all earlier paid orders. A single total per customer would hide how their spend changes after each order. Two orders placed in the same second still get separate running totals.

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

1. Keep only rows that match `status = 'paid'` before you add up orders.

   **Why:** The altered data includes a pending order for 9,000 cents at the same recorded time as paid orders. If the sum includes that order, later totals will be too high. Hiding the pending order's row would leave the totals wrong.

2. Partition `SUM(total_cents)` by `customer_id` so each customer has a separate group of rows.

   **Why:** Two customers can pay at the same time. A customer's running total must exclude orders paid by anyone else. The window function adds values from related rows and still returns one row per paid order.

3. Order each customer's window by `placed_at`, with lower `order_id` values first when the times match.

   **Why:** The customer placed order 111 before order 103, even though 111 has the higher ID. Orders 103 and 107 share a timestamp, or recorded time. Order 103 comes first and gets its own total before order 107 adds to it.

4. Specify `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.

   **Why:** The frame tells SQL which rows to sum for the current order. It starts with the customer's first paid order and stops at the current row. Stating the frame makes those limits clear. Peers are rows with the same values in all the sorting columns. Here the order ID is unique, so even the default frame would have no peers to include.

5. Sort the result by customer, then by timestamp and order ID within each customer.

   **Why:** Readers see each customer's orders in the same order the sum follows. If a total already includes a later order by mistake, sorting the displayed rows cannot fix it.

## Why the tempting answer fails

The tempting query orders the window by timestamp alone. The visible payments at the same time belong to different customers, so they are in separate partitions and do not count as peers.

In the altered data, order 103 should show 1,600 cents. With only the timestamp to sort by, the default `RANGE` frame treats order 107 as a peer. It gives both orders 4,700 cents.

## What the interviewer listens for

Explain how the sorting columns decide which order comes first. Name the rows that the frame adds together. MySQL 8 and PostgreSQL support the same syntax. Both include peers by default when the window specifies an order.

## Sources

- [SQLite window frame rules](https://www.sqlite.org/windowfunctions.html#framespec)
- [SQLite filtering and output ordering](https://www.sqlite.org/lang_select.html)
- [MySQL window frames](https://dev.mysql.com/doc/refman/8.4/en/window-functions-frames.html)
- [PostgreSQL window function calls](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS)
