---
problem: sql/march-paid-orders
---

Use the start of March as an inclusive lower bound and the start of April as an exclusive upper bound. The timestamps have the same fixed-width UTC format, so comparing these text values also compares their time order. Rows with unknown timestamps fail the range filter.

```sql
SELECT order_id, placed_at, total_cents
FROM orders
WHERE status = 'paid'
  AND placed_at >= '2026-03-01 00:00:00'
  AND placed_at < '2026-04-01 00:00:00';
```

The decoy uses `BETWEEN` with a date-only upper bound. It returns visible orders 1 and 3 because neither was placed on March 31. A string such as `2026-03-31 00:00:00` sorts after `2026-03-31`, so even midnight of the last day is missing. Substituting midnight on April 1 into `BETWEEN` would include an order that belongs to the next report.

Explain which endpoint is included. Test orders just before and at midnight on March 1. Do the same at midnight on April 1. MySQL and PostgreSQL also support the half-open pattern with typed timestamps. Set the bounds in the time zone the report defines, and use timestamp types or casts matching the stored column.

See [SQLite `BETWEEN`](https://www.sqlite.org/lang_expr.html#the_between_operator) and [date and time values](https://www.sqlite.org/lang_datefunc.html).
