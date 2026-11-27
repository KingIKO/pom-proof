---
problem: sql/orphan-order-lines
---

## What is going on

The staging import can contain a line with a broken order link, a broken product link, or both. A link can be broken even if the line supplies an ID. The report must keep each affected line and tell the importer which link needs repair.

## The fix

```sql
SELECT l.line_id,
  CASE WHEN o.order_id IS NULL THEN 1 ELSE 0 END AS missing_order,
  CASE WHEN p.product_id IS NULL THEN 1 ELSE 0 END AS missing_product
FROM order_lines l
LEFT JOIN orders o ON o.order_id = l.order_id
LEFT JOIN products p ON p.product_id = l.product_id
WHERE o.order_id IS NULL OR p.product_id IS NULL
ORDER BY l.line_id;
```

1. Start from `order_lines` and left join `orders` on `order_id`.

   **Why:** Line 103 points to a nonexistent order. An inner join would remove the very line the import check needs to report.

2. Left join `products` using the line's `product_id`.

   **Why:** The two lookups are independent. Line 103 still has a valid product, and line 102 still has a valid order. Each side must be checked even if the other fails.

3. Set each numeric flag by testing the corresponding joined primary key for `NULL`.

   **Why:** On the order side, both line 103's nonexistent ID and line 105's blank ID produce no matched key. Testing only the staging value for `NULL` would miss line 103.

4. Use `OR` to keep rows with either joined key missing.

   **Why:** A broken link needs attention even when the other link is valid. A line whose two links work must stay out of the exception report.

5. Sort by `l.line_id`.

   **Why:** Missing parent IDs provide no consistent sorting key. The staging line ID lets an importer find each reported row in order.

## Why the tempting answer fails

The decoy uses `AND`. Line 33 is the only visible orphan and has two broken links, so it passes that narrower test. In the altered data, line 102 has a valid order and a missing product. `AND` drops it, whereas the report should include it with flags `0` and `1`.

## What the interviewer listens for

Walk through all four combinations of matched and missing parents. Include missing links with both populated and empty staging IDs.

## Sources

- [SQLite joins, filters, and ordering](https://www.sqlite.org/lang_select.html)
- [SQLite `CASE` and logical expressions](https://www.sqlite.org/lang_expr.html)
