---
problem: sql/order-value-buckets
---

Use `CASE` to assign one label per order. Check `NULL` before the numeric bands so a missing total gets its own label. Then test the upper bound of each band in ascending order. A total that gets past `small` is already at least 5,000 cents.

```sql
SELECT order_id,
  CASE
    WHEN total_cents IS NULL THEN 'unknown'
    WHEN total_cents < 5000 THEN 'small'
    WHEN total_cents < 20000 THEN 'standard'
    ELSE 'high'
  END AS value_bucket
FROM orders;
```

The decoy changes both strict upper bounds to inclusive ones. There is no order at either threshold in the visible seed, so the wrong comparisons have no effect there. On an order of exactly 5,000 cents the decoy stops at `small`, and at exactly 20,000 it stops at `standard`. Omitting the explicit `NULL` branch would be a separate mistake. The numeric checks evaluate to unknown for a missing total, so it would fall into `high` by default.

An interviewer will look for cases just below, at, and just above each threshold. Keep the examples in cents so each boundary step has an exact integer value. Also compare zero with `NULL`: zero belongs in `small`, and `NULL` belongs in `unknown`.

See [SQLite `CASE`](https://www.sqlite.org/lang_expr.html#the_case_expression).
