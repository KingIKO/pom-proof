---
problem: sql/revenue-per-category
---

Compute revenue from the quantity and unit price on each eligible line. The order provides the status and the product provides the category. Taking each field from its owning table preserves what the customer was charged, even after the catalog changes.

```sql
SELECT p.category, SUM(l.quantity * l.unit_price_cents) AS revenue_cents
FROM order_lines l
JOIN orders o ON o.order_id = l.order_id
JOIN products p ON p.product_id = l.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.category;
```

The visible lines all have the current catalog price, so the decoy using that price also gives 10,500 cents for Lighting and 2,250 for Hardware. Storage appears only on a cancelled order and should be absent. A later price increase would make historical revenue look larger in the decoy. The line price is the right input whether the difference came from a price change or an agreed discount.

An interviewer may ask what a row represents before the `SUM`. The line is the unit, and an order can contribute to more than one category. Try a repriced product with quantity greater than one and a cancelled line for a category that also has eligible lines. The first tests the price source; the second tests that cancellation acts on the order, before grouping.

See [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html).
