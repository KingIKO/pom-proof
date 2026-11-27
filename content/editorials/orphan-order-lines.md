---
problem: sql/orphan-order-lines
---

## What is going on

The staging import holds order lines before the import applies foreign keys. A foreign key requires a supplied ID to point to an existing row. A staged line can have a broken order link, a broken product link, or both. A link can be broken even when the line supplies an ID. The report must keep each affected line and tell the importer which link needs repair.

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

   **Why:** A left join keeps every order line, even when no order matches. Line 103 points to an order that does not exist. An inner join keeps only matched rows, so it would remove that line. Line 103 is exactly the line the import check needs to report.

2. Left join `products` on the line's `product_id`.

   **Why:** The order lookup and the product lookup do not depend on each other. Line 103 still has a valid product, and line 102 still has a valid order. The query must check each side even when the other side fails.

3. Set each numeric flag by checking whether the joined primary key is `NULL`.

   **Why:** The primary key here is the ID column that identifies each row in a table. When a left join finds no match, the joined key is `NULL`, which means no value. On the order side, line 103 has an ID that does not exist, and line 105 has a blank ID. Neither line finds a matching key. A `NULL` test on the staging value alone would miss line 103.

4. Use `OR` to keep rows where either joined key is missing.

   **Why:** A broken link needs attention even when the other link is valid. A line with two working links must stay out of the exception report, the list of lines that need repair.

5. Sort by `l.line_id`.

   **Why:** Each line points to two parent rows, its order and its product. When a parent is missing, its joined ID is `NULL`, so it gives no consistent sort order. The staging line ID lets the importer find each reported row in order.

## Why the tempting answer fails

The decoy uses `AND`, so it keeps only lines where both links are broken. Line 33 is the only visible orphan, meaning a line with a missing parent. It has two broken links, so it passes that narrower test. In the altered data, line 102 has a valid order and a missing product. `AND` drops that line, but the report should include it with flags `0` and `1`.

## What the interviewer listens for

Walk through all four combinations of matched and missing parents. Include missing links where the staging ID is filled in and where it is empty.

## Sources

- [SQLite joins, filters, and ordering](https://www.sqlite.org/lang_select.html)
- [SQLite `CASE` and logical expressions](https://www.sqlite.org/lang_expr.html)
