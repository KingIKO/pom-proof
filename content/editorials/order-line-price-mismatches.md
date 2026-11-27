---
problem: sql/order-line-price-mismatches
---

## What is going on

This QA batch freezes the catalog, so product prices do not change while it runs. The batch also allows no discounts. So the price of the linked product is the expected price for each order line. Ordinary past orders could have a different price for valid reasons.

## The fix

```sql
SELECT l.order_id, l.line_id, l.unit_price_cents AS stored_price_cents,
  p.current_price_cents AS catalog_price_cents
FROM order_lines l
JOIN products p ON p.product_id = l.product_id
WHERE l.unit_price_cents IS NOT p.current_price_cents
ORDER BY l.order_id, l.line_id;
```

1. Inner join each `order_lines` row to `products` by `product_id`.

   **Why:** An inner join keeps only lines that match a product. An amount of 1,800 cents may be right for one product and wrong for another. Compare each line with its own product. A left join would also keep lines with no matching product. The exercise guarantees a product match for every line, so a left join has nothing extra to keep.

2. Use `IS NOT` to compare the stored and catalog prices.

   **Why:** `NULL` marks a missing value. In SQLite, `IS NOT` gives a definite true or false result even when one side is `NULL`. For a free product, a stored zero matches the catalog price, but a missing price is a mismatch. `COALESCE` could replace the missing price with zero, but that would hide this mismatch.

3. Return both prices, each under its own alias.

   **Why:** An alias is a new name for a column in the result. With both prices shown, reviewers can see whether a line has the wrong number or no value at all. For line 103, the result shows `NULL` next to a catalog price of zero. That makes the difference visible.

4. Order by `order_id`, then `line_id`.

   **Why:** One order can have more than one affected line. Sorting by line ID puts those rows in order within each order. That order helps a reviewer reconcile the report, meaning check each row against the order records.

PostgreSQL writes the same comparison as `IS DISTINCT FROM`. MySQL has a null-safe equality operator, `<=>`, which gives a definite result even when one side is `NULL`. In MySQL, negate it: `NOT (l.unit_price_cents <=> p.current_price_cents)`.

## Why the tempting answer fails

The decoy uses `<>`, the ordinary not-equal operator. It finds the visible mismatches on lines 22 and 24, because every visible line has a stored price. In the altered data, line 101 has no stored price. Line 103 also has no stored price, and its product is free. Ordinary inequality gives unknown for both lines, so `WHERE` drops them.

## What the interviewer listens for

Explain why the catalog price is a valid comparison in this batch. Then test two lines for the same free product. One line has a missing price, and the other has a stored zero.

## Sources

- [SQLite comparison operators](https://www.sqlite.org/lang_expr.html)
- [SQLite joins, filters, and ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL comparison predicates](https://www.postgresql.org/docs/current/functions-comparison.html)
- [MySQL comparison operators](https://dev.mysql.com/doc/refman/8.4/en/comparison-operators.html)
