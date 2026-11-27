---
problem: sql/march-paid-orders
---

## What is going on

The export covers March 2026 in UTC, the time standard the report uses. Each timestamp records when an order was placed. Each part of the stored text has a fixed number of digits. That means the text sorts in time order. Use the same level of detail for the dates that mark the start and end of the range.

## The fix

```sql
SELECT order_id, placed_at, total_cents
FROM orders
WHERE status = 'paid'
  AND placed_at >= '2026-03-01 00:00:00'
  AND placed_at < '2026-04-01 00:00:00';
```

1. Keep rows with `status = 'paid'`.

   **Why:** The date only tells you when the customer placed the order. For example, a cancelled order placed on March 31 still belongs outside the paid export.

2. Set the lower bound to `2026-03-01 00:00:00`, including that exact time.

   **Why:** The lower bound is the earliest time the query accepts. Midnight at the start of March belongs in the report. The paid order one second earlier belongs to February. Specifying the year also rules out the March 2025 row.

3. Set the upper bound to `2026-04-01 00:00:00`, excluding that exact time.

   **Why:** All orders on March 31 sort before the upper bound, from midnight to 23:59:59. If an order arrives right at the start of April, it belongs in the next month's report.

4. Use the range comparisons as written to leave out missing timestamps.

   **Why:** A `NULL` timestamp means the order has no recorded time. Comparing it to either date gives an unknown result. The `WHERE` clause keeps only rows that pass the comparison. A substitute date would assign the order to a month without evidence.

This is a half-open range because it includes the start and excludes the end. MySQL and PostgreSQL also support this range with columns that store timestamps as date and time values. Use the column's type or cast the bounds to it, which means converting them to that type. Set both bounds in the report's time zone.

## Why the tempting answer fails

The tempting query uses `BETWEEN` with dates that have no time of day. It returns visible orders 1 and 3 because neither falls on March 31. In the altered data, even `2026-03-31 00:00:00` sorts after the shorter text `2026-03-31`. The query misses both paid orders on March 31.

The `BETWEEN` comparison includes both bounds. If you set its upper bound to April midnight, it would let April's first order in.

## What the interviewer listens for

State which bound belongs to the report. Test orders just before and exactly at both midnight bounds. Also test a late order on the last day and one without a timestamp.

## Sources

- [SQLite `BETWEEN` and `NULL` comparisons](https://www.sqlite.org/lang_expr.html#the_between_operator)
- [SQLite date and time values](https://www.sqlite.org/lang_datefunc.html)
- [SQLite text comparison](https://www.sqlite.org/datatype3.html)
- [SQLite `WHERE`](https://www.sqlite.org/lang_select.html)
- [PostgreSQL date and time types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [PostgreSQL comparisons](https://www.postgresql.org/docs/current/functions-comparison.html)
- [MySQL date and time types](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/datetime.html)
- [MySQL comparisons](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/comparison-operators.html)
