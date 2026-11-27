---
problem: sql/revenue-per-category
---

## What is going on

The category is a current catalog attribute, meaning it comes from the product as it is listed today. Revenue reflects what was charged on each order line. Catalog prices can change after checkout. One order can also cover several categories, so the calculation starts from the order line.

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

   **Why:** An inner join keeps only the lines that have a matching order. The status belongs to the order and applies to all of its lines. Every line in this data has an order. The report has no rule for counting a line without one.

2. Inner join `products` by the line's product ID.

   **Why:** Lines from the same order can belong to different categories. Each line's product supplies its category. A left join would also keep lines with no product. No such line exists here, so a left join has nothing extra to keep.

3. Exclude lines from cancelled orders before grouping.

   **Why:** In the altered data, the Storage category has a completed line and a cancelled line. The completed amount should remain, and the cancelled line should add nothing. Lighting has only a cancelled line in that data, so it disappears.

4. Compute `quantity * unit_price_cents` using fields from the line.

   **Why:** Line 101 charges 4,400 cents per unit for two units. The product now lists 5,500 cents. The price stored on the line is what the order was charged. It also keeps an agreed discount, if a discount is why the prices differ.

5. Group by `p.category` and sum the line amounts.

   **Why:** Several lines and products can add to Tools. Each eligible line must count, including repeated lines for one product. After that, the category appears as a single total.

## Why the tempting answer fails

The decoy uses the current catalog price instead of the price saved on the line. All visible prices match, so both queries return 10,500 cents for Lighting and 2,250 for Hardware. Storage has only a cancelled line in that data, so neither query lists it. In the altered data, the Tools prices have changed. So the decoy reports 18,300 cents instead of the recorded 15,600.

## What the interviewer listens for

Say what one row stands for just before the query sums it. Test a repriced line with more than one unit. Also test a cancelled line in a category that has other revenue that counts.

## Sources

- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite joins, filtering, and grouping](https://www.sqlite.org/lang_select.html)
- [SQLite multiplication expressions](https://www.sqlite.org/lang_expr.html)
