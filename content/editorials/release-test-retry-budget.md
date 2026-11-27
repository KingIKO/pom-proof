---
problem: sql/release-test-retry-budget
---

## What is going on

The report flags release and case pairs that used at least three executed attempts. The first execution counts, and the budget starts over in each release. A skipped entry is only a record of an attempt that did not run. The count should tell a reviewer how many times the runner actually executed that case.

## The fix

```sql
SELECT release_id, case_id, COUNT(*) AS executed_attempts
FROM test_runs
WHERE outcome IN ('passed', 'failed')
GROUP BY release_id, case_id
HAVING COUNT(*) >= 3;
```

1. Keep only `passed` and `failed` rows in `WHERE`.

   **Why:** An Add card failure, skip, and pass in R21 represent two executions. Filtering before grouping keeps the skip out of that count.

2. Group by both `release_id` and `case_id`.

   **Why:** View refund has two attempts in R14 and one in R15. Grouping only by case would combine them and flag a budget that neither release used.

3. Return `COUNT(*)` as `executed_attempts`.

   **Why:** Every row that survived the filter counts, including the first attempt. Two failures and a pass for a single case are three executions even though there are only two distinct outcomes.

4. Use `HAVING COUNT(*) >= 3`.

   **Why:** The threshold depends on the size of each finished group. `HAVING` can compare that size, and `>=` lets exactly three attempts qualify.

## Why the tempting answer fails

The decoy counts every run. There are no visible skips, so only Apply coupon in R14 qualifies under either query. In the altered data the decoy flags Add card in R21 with only two executions. It also reports four for Send receipt in R21, which qualifies but had only three executions plus a skip.

## What the interviewer listens for

Explain why outcome belongs in `WHERE` and the threshold belongs in `HAVING`. Check exactly three executions in one release and the same total split across releases as separate cases.

## Sources

- [SQLite grouping and `HAVING`](https://www.sqlite.org/lang_select.html)
- [SQLite `COUNT`](https://www.sqlite.org/lang_aggfunc.html)
