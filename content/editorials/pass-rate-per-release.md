---
problem: sql/pass-rate-per-release
---

## What is going on

The dashboard reports the share of executed attempts that passed. An executed attempt is a run that passed or failed, and each retry counts as its own attempt. A release with no executions needs a row with an undefined rate. That row lets readers tell it apart from a release whose attempts all failed.

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

   **Why:** A left join keeps every release, even one with no matching runs. R24 has no run rows in the altered data. An inner join keeps only matches, so it would drop R24. The dashboard needs to show R24 with no rate.

2. Group by `r.release_id`.

   **Why:** A release can have many attempts, such as a failure and a successful retry of the same case. Grouping by release lets both runs count toward one figure for that release. It also keeps each release's runs apart from other releases.

3. Sum a `1` for each pass and zero for other outcomes.

   **Why:** This sum is the numerator, the top of the fraction. A failed run is an execution, but it adds nothing to the numerator. R23 has a failed run and a skip, so its pass count is zero.

4. Sum a `1` for each pass or failure to get the denominator.

   **Why:** The denominator is the bottom of the fraction. Skipped runs add nothing to it. The empty placeholder row from the left join adds nothing either. R21 has three executed attempts, even though the run table has four rows for it.

5. Use `NULLIF(..., 0)` on the denominator.

   **Why:** R22 has only skips, so its rate is undefined. `NULLIF` turns a zero denominator into `NULL`, the marker for no value. Dividing by `NULL` makes the calculation return `NULL`. That result stays distinct from R23's rate, which is a defined zero.

6. Multiply by `100.0` before dividing.

   **Why:** In SQLite, dividing one integer, or whole number, by another drops any fraction from the result. The decimal point makes SQLite treat `100.0` as a number that can have a fraction. Multiplying by it first keeps the fractional part when SQLite divides.

7. Round the percentage to two places.

   **Why:** Rounding makes the rate easier to read. If you round the fraction to two places before multiplying by 100, two passes from three executions give 67 percent. Rounding the final percentage gives 66.67 percent.

## Why the tempting answer fails

The decoy divides by the count of run IDs, so skipped runs count too. On the visible data, it gives the same rates, 66.67 for R14 and 50 for R15, because no visible run is skipped. R16 still has no rate. In the altered data, R21 has two passes from three executions plus one skip. So the decoy wrongly reports 50.

A release with one pass and one skip would also get 50 from the decoy instead of 100. A release with only skips gets zero instead of `NULL`.

## What the interviewer listens for

Explain that zero means the release had executions but no passes. Explain that `NULL` means it had no executions. Check both a release with only skips and a release without any run records.

## Sources

- [SQLite arithmetic expressions](https://www.sqlite.org/lang_expr.html)
- [SQLite aggregate functions](https://www.sqlite.org/lang_aggfunc.html)
- [SQLite `NULLIF` and `ROUND`](https://www.sqlite.org/lang_corefunc.html)
- [SQLite outer joins and grouping](https://www.sqlite.org/lang_select.html)
