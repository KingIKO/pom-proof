---
problem: sql/pass-rate-per-release
---

## What is going on

The dashboard reports the share of executed attempts that passed. Retries count separately. A release with no executions needs a row with an undefined rate so it can be distinguished from a release whose attempts all failed.

## The fix

```sql
SELECT r.release_id,
  ROUND(100.0 * SUM(CASE WHEN t.outcome = 'passed' THEN 1 ELSE 0 END)
    / NULLIF(SUM(CASE WHEN t.outcome IN ('passed', 'failed') THEN 1 ELSE 0 END), 0), 2)
    AS pass_rate_pct
FROM releases r
LEFT JOIN test_runs t ON t.release_id = r.release_id
GROUP BY r.release_id;
```

1. Start from `releases` and left join `test_runs` on `release_id`.

   **Why:** R24 has no run rows in the altered data. An inner join would remove the release, but the dashboard needs to show that it has no rate.

2. Group by `r.release_id`.

   **Why:** A release can have many attempts, including a failure and a successful retry of the same case. Grouping by release lets both runs count toward one release figure without mixing releases.

3. Sum a `1` for each pass and zero for other outcomes.

   **Why:** A failed run is an execution but contributes nothing to the numerator. R23 has a failed run and a skip, so its pass count is zero.

4. Sum a `1` for each pass or failure in the denominator.

   **Why:** Skipped runs and the left join's empty placeholder add nothing. R21 has three executed attempts even though the run table has four rows for it.

5. Use `NULLIF(..., 0)` on the denominator.

   **Why:** R22 has only skips, so its rate is undefined. `NULLIF` turns the zero denominator into `NULL` so the calculation returns `NULL`, distinct from R23's defined zero rate.

6. Multiply by `100.0` before dividing, then round to two places.

   **Why:** Two passes from three executions should yield 66.67 percent. Using a real operand before division preserves the fraction in SQLite, where integer division truncates.

## Why the tempting answer fails

Counting run IDs gives the same visible rates, 66.67 for R14 and 50 for R15, because no visible run is skipped. R16 still has no rate. In the altered data, R21 has two passes from three executions and one skip, so the decoy wrongly reports 50. With one pass and one skip it would likewise report 50 instead of 100. With only skips it reports zero instead of `NULL`.

## What the interviewer listens for

Explain why zero means there were executions with no passes and why `NULL` means there were no executions. Check both a skip-only release and a release without any run records.

## Sources

- [SQLite arithmetic expressions](https://www.sqlite.org/lang_expr.html)
- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite `NULLIF` and `ROUND`](https://www.sqlite.org/lang_corefunc.html)
- [SQLite outer joins and grouping](https://www.sqlite.org/lang_select.html)
