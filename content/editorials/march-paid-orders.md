---
problem: sql/march-paid-orders
---

## What is going on

The export covers March 2026 in UTC. The column holds fixed-width timestamp text, so sorting these values as text also puts them in time order. The boundaries need the same precision as the stored values.

## The fix

```sql
SELECT order_id, placed_at, total_cents
FROM orders
WHERE status = 'paid'
  AND placed_at >= '2026-03-01 00:00:00'
  AND placed_at < '2026-04-01 00:00:00';
```

1. Keep rows with `status = 'paid'`.

   **Why:** A cancelled order placed on March 31 still belongs outside the paid export. A correct date alone does not establish eligibility.

2. Set the inclusive lower bound to `2026-03-01 00:00:00`.

   **Why:** Midnight belongs to March, but the paid order one second earlier belongs to February. Including the year also rules out the March 2025 row.

3. Set the exclusive upper bound to `2026-04-01 00:00:00`.

   **Why:** Every March 31 order, from midnight to 23:59:59, sorts before that bound. An order exactly at April midnight belongs in the next month's report.

4. Leave missing timestamps out by using the range comparisons as written.

   **Why:** A `NULL` timestamp makes the comparisons unknown, so `WHERE` excludes the row. A substitute date would assign an order to a month without evidence.

MySQL and PostgreSQL also support these half-open bounds with typed timestamps. Use types or casts that match the stored column and set the bounds in the report's time zone.

## Why the tempting answer fails

The date-only `BETWEEN` returns visible orders 1 and 3 because neither falls on March 31. In the altered data, even `2026-03-31 00:00:00` sorts after the shorter string `2026-03-31`, so both March 31 orders disappear. Replacing the upper endpoint with April midnight inside inclusive `BETWEEN` would let April's first order in.

## What the interviewer listens for

State which endpoint belongs to the report. Test just before and at each midnight boundary, plus a late order on the last day and one without a timestamp.

## Sources

- [SQLite `BETWEEN` and `NULL` comparisons](https://www.sqlite.org/lang_expr.html#the_between_operator)
- [SQLite date and time values](https://www.sqlite.org/lang_datefunc.html)
- [SQLite text comparison](https://www.sqlite.org/datatype3.html)
- [SQLite `WHERE`](https://www.sqlite.org/lang_select.html)
- [PostgreSQL date and time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [PostgreSQL comparisons](https://www.postgresql.org/docs/current/functions-comparison.html)
- [MySQL date and time types](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/datetime.html)
- [MySQL comparisons](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/comparison-operators.html)
