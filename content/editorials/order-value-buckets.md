---
problem: sql/order-value-buckets
---

## What is going on

Every order needs a value label, even an order with no recorded total. The thresholds, the amounts where one band ends and the next begins, are in whole cents. An order of exactly 5,000 cents starts a new band. So does an order of exactly 20,000 cents.

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

1. Label every row of `orders` with one `CASE` expression, without filtering.

   **Why:** A `CASE` expression checks its conditions in order and returns the value of the first true one. Two orders can share a total, such as exactly 5,000 cents. The report must still label each order ID. Grouping by total would merge those orders and lose individual rows.

2. Check `total_cents IS NULL` first and return `unknown`.

   **Why:** A missing total is `NULL`, and every numeric comparison with `NULL` gives unknown. Without this branch, the row would fall through every test and reach `high`. Zero is a recorded amount, so it goes to `small`.

3. Test `total_cents < 5000` for `small`.

   **Why:** At 4,999 cents, this first numeric branch should match. At 5,000 cents, it must not match, so the row moves on to the next branch.

4. Test `total_cents < 20000` for `standard`.

   **Why:** `CASE` picks the first true branch. So a known total that reaches this second numeric test is already at least 5,000. The strict comparison, less than rather than less than or equal, keeps 19,999 in this band. It also leaves out 20,000.

5. Use `ELSE` for `high`.

   **Why:** A row that reaches `ELSE` has a known total of at least 20,000. The earlier branches have already proved that. A separate comparison would only repeat it.

## Why the tempting answer fails

The decoy makes both upper bounds inclusive by using `<=` instead of `<`. No visible order sits exactly at either cutoff, so both queries give the same labels. In the altered data, both 5,000-cent orders stop at `small`. The 20,000-cent order stops at `standard`. All three belong in the next band up.

## What the interviewer listens for

Test just below, exactly at, and just above each cutoff, using integer cents. Also compare a recorded zero with `NULL`. That way, the boundary tests also cover the rule for missing values.

## Sources

- [SQLite `CASE` and comparison expressions](https://www.sqlite.org/lang_expr.html#the_case_expression)
- [SQLite row selection](https://www.sqlite.org/lang_select.html)
