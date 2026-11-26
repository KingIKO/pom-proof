---
problem: sql/orphan-order-lines
---

Use a left join for each parent table because order lines are the records under inspection. Check the primary keys on the joined parents. A `NULL` in one of those columns means the line did not match a row on that side, whether the original ID was blank or pointed to an absent record.

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

On the visible data, line 33 is the only orphan and both of its parents are absent. The decoy with `AND` also returns it. If an order exists but its product does not, that conjunction becomes false and the line vanishes. `OR` brings either failure into the report and the separate flags indicate which repair is needed.

In an interview, walk through the four combinations of matched and missing parents, including a missing link with a populated ID. Checking only the staging ID for `NULL` misses a populated reference to a nonexistent parent. An inner join would also hide the exact row the QA check needs to find.

See the [SQLite join documentation](https://www.sqlite.org/lang_select.html).
