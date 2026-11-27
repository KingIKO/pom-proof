---
problem: sql/order-line-price-mismatches
---

## What is going on

This QA batch freezes the catalog and allows no discounts. That makes the price of the linked product the expected value for its order line. Ordinary historical orders could legitimately have a different price.

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

   **Why:** An amount of 1,800 cents may be valid for one product and wrong for another. The exercise guarantees a product match, so there is no unmatched line to preserve with a left join.

2. Use `IS NOT` to compare the stored and catalog prices.

   **Why:** SQLite gives a definite result even when a side is `NULL`. For a free product, a stored zero matches the catalog but a missing price is a mismatch. Substituting zero with `COALESCE` would hide the latter.

3. Return both prices with distinct aliases.

   **Why:** Reviewers can see whether a line has the wrong number or no value at all. For line 103, displaying `NULL` beside catalog zero makes that distinction visible.

4. Order by `order_id`, then `line_id`.

   **Why:** One order can have more than one affected line. The line ID orders those rows within the order for reconciliation.

PostgreSQL spells the comparison `IS DISTINCT FROM`. In MySQL, negate null-safe equality: `NOT (l.unit_price_cents <=> p.current_price_cents)`.

## Why the tempting answer fails

The decoy uses `<>`. It finds the visible mismatches on lines 22 and 24 because all stored prices are present. In the altered data, line 101 has no stored price and line 103 has no stored price for a free product. Ordinary inequality gives unknown for both, and `WHERE` drops them.

## What the interviewer listens for

State why the catalog is a valid comparison here and test a missing price and a stored zero for the same free product.

## Sources

- [SQLite comparison operators](https://www.sqlite.org/lang_expr.html)
- [SQLite joins, filters, and ordering](https://www.sqlite.org/lang_select.html)
- [PostgreSQL comparison predicates](https://www.postgresql.org/docs/current/functions-comparison.html)
- [MySQL comparison operators](https://dev.mysql.com/doc/refman/8.4/en/comparison-operators.html)
