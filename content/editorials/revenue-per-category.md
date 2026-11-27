---
problem: sql/revenue-per-category
---

## What is going on

The category is a current catalog attribute, while revenue reflects what was charged on each order line. Catalog prices can change after checkout. An order can also cover several categories, so the calculation starts from the line.

## The fix

```sql
SELECT p.category, SUM(l.quantity * l.unit_price_cents) AS revenue_cents
FROM order_lines l
JOIN orders o ON o.order_id = l.order_id
JOIN products p ON p.product_id = l.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.category;
```

1. Inner join `order_lines` to `orders` by order ID.

   **Why:** The status belongs to the order and applies to all its lines. Every line in this data has an order; the report has no rule for an unmatched line to contribute.

2. Inner join `products` by the line's product ID.

   **Why:** Lines from the same order can go to different categories. An existing product supplies the category for each line; there is no category-free line to preserve with a left join.

3. Exclude cancelled order lines before grouping.

   **Why:** The altered Storage category includes a completed line and a cancelled line. The completed amount should survive without the cancelled line adding anything. Lighting, with only a cancelled line there, disappears.

4. Compute `quantity * unit_price_cents` using fields from the line.

   **Why:** Line 101 charges 4,400 cents per unit for two units, even though the product now lists 5,500. The stored amount also preserves an agreed discount if that is why the prices differ.

5. Group by `p.category` and sum the line amounts.

   **Why:** Several lines and products can contribute to Tools. Each eligible line must count, including repeated lines for one product, before the category appears as a single total.

## Why the tempting answer fails

The decoy substitutes the catalog price for the saved price. All visible prices match, so both queries return 10,500 cents for Lighting and 2,250 for Hardware, with cancelled-only Storage absent. In the altered data the changed Tools prices make the decoy report 18,300 cents instead of the recorded 15,600.

## What the interviewer listens for

Name what each row represents just before the sum. Test a repriced line with more than one unit and a cancelled line in a category that also has qualifying revenue.

## Sources

- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite joins, filtering, and grouping](https://www.sqlite.org/lang_select.html)
- [SQLite multiplication expressions](https://www.sqlite.org/lang_expr.html)
