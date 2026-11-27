---
problem: sql/order-value-buckets
---

## What is going on

Every order needs a value label, including orders with no recorded total. The thresholds are in whole cents. Exactly 5,000 and exactly 20,000 start new bands.

## The fix

```sql
SELECT order_id,
  CASE
    WHEN total_cents IS NULL THEN 'unknown'
    WHEN total_cents < 5000 THEN 'small'
    WHEN total_cents < 20000 THEN 'standard'
    ELSE 'high'
  END AS value_bucket
FROM orders;
```

1. Select from `orders` without filtering and use one `CASE` expression per row.

   **Why:** Two orders can share a total, including exactly 5,000 cents, and the report must label each ID. Grouping by total would lose individual orders.

2. Check `total_cents IS NULL` and return `unknown` first.

   **Why:** A missing total makes the numeric conditions unknown, so without this branch it would fall all the way through to `high`. Zero is a recorded amount and goes to `small`.

3. Test `total_cents < 5000` for `small`.

   **Why:** At 4,999 cents the first numeric branch should match. At 5,000 cents it must let the row reach the next branch.

4. Test `total_cents < 20000` for `standard`.

   **Why:** `CASE` picks the first true branch, so a known value reaching the second numeric test is already at least 5,000. The strict comparison keeps 19,999 in this band and excludes 20,000.

5. Use `ELSE` for `high`.

   **Why:** A row that reached this point has a known total of at least 20,000. A separate comparison would repeat a fact the earlier branches already established.

## Why the tempting answer fails

The decoy makes both upper bounds inclusive. No visible order is exactly at either cutoff, so all of those labels agree. In the altered data, both 5,000-cent orders stop at `small`, and the 20,000-cent order stops at `standard`. All three belong in the next band.

## What the interviewer listens for

Test just below, exactly at, and just above each cutoff with integer cents. Compare a recorded zero with `NULL` so that boundary checks also cover the missing-value rule.

## Sources

- [SQLite `CASE` and comparison expressions](https://www.sqlite.org/lang_expr.html#the_case_expression)
- [SQLite row selection](https://www.sqlite.org/lang_select.html)
