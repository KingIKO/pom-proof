---
problem: sql/release-test-retry-budget
---

## What is going on

The report flags each release and case pair that used at least three executed attempts. An executed attempt is a run that passed or failed. The first execution counts as an attempt. The attempt budget starts over in each release.

A skipped entry only records an attempt that did not run. The count should tell a reviewer how many times the runner actually executed that case.

## The fix

```sql
SELECT release_id, case_id, COUNT(*) AS executed_attempts
FROM test_runs
WHERE outcome IN ('passed', 'failed')
GROUP BY release_id, case_id
HAVING COUNT(*) >= 3;
```

1. Keep only `passed` and `failed` rows in `WHERE`.

   **Why:** In R21, Add card has a failure, a skip, and a pass. That is two executions. The filter runs before grouping, so the skip never reaches the count.

2. Group by both `release_id` and `case_id`.

   **Why:** View refund has two attempts in R14 and one in R15. Grouping only by case would add them together. It would then flag a budget that neither release used.

3. Return `COUNT(*)` as `executed_attempts`.

   **Why:** `COUNT(*)` counts every row left after the filter, including the first attempt. Two failures and a pass for one case are three executions. That is true even though there are only two distinct outcomes.

4. Use `HAVING COUNT(*) >= 3`.

   **Why:** The threshold depends on the size of each finished group. `WHERE` checks single rows before grouping, so it cannot see that size. `HAVING` checks each group after grouping. The `>=` comparison lets exactly three attempts qualify.

## Why the tempting answer fails

The decoy counts every run, including skips. There are no visible skips, so both queries flag only Apply coupon in R14. In the altered data, the decoy flags Add card in R21, which had only two executions. It also reports four attempts for Send receipt in R21. That pair does qualify, but it had only three executions plus a skip.

## What the interviewer listens for

Explain why the outcome check belongs in `WHERE` and the minimum count belongs in `HAVING`. Test a case with exactly three executions in one release. Then test the same case with three executions split across releases.

## Sources

- [SQLite grouping and `HAVING`](https://www.sqlite.org/lang_select.html)
- [SQLite `COUNT`](https://www.sqlite.org/lang_aggfunc.html)
