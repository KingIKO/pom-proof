---
problem: sql/order-line-price-mismatches
---

Compare each stored price with the price of its own product. SQLite's `IS NOT` gives a definite result when either side is `NULL`. With a known catalog price, a missing stored price therefore counts as a mismatch.

```sql
SELECT l.order_id, l.line_id, l.unit_price_cents AS stored_price_cents,
  p.current_price_cents AS catalog_price_cents
FROM order_lines l
JOIN products p ON p.product_id = l.product_id
WHERE l.unit_price_cents IS NOT p.current_price_cents
ORDER BY l.order_id, l.line_id;
```

The decoy with `<>` finds lines 22 and 24 on the visible seed. All stored prices are present there. When a stored price is `NULL`, ordinary inequality evaluates to unknown, which `WHERE` excludes. A missing value must still show up even for a free product. Substituting zero with `COALESCE` would hide that defect by making a missing price look like a copied zero.

Say why this comparison is valid: the exercise freezes the catalog and rules out discounts. A historical order may legitimately use another price. A test batch should include both an allowed zero price and a missing price on a free product. [PostgreSQL](https://www.postgresql.org/docs/current/functions-comparison.html) expresses the comparison with `IS DISTINCT FROM`. [MySQL](https://dev.mysql.com/doc/refman/8.4/en/comparison-operators.html) uses the negation of its null-safe equality operator, `NOT (l.unit_price_cents <=> p.current_price_cents)`.

See [SQLite comparison operators](https://www.sqlite.org/lang_expr.html).
