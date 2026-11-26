---
problem: sql/pass-rate-per-release
---

Count passed attempts in the numerator and executed attempts in the denominator. A left join from releases keeps the release even when the run table contributes no records. Each attempt counts on its own, so a failed run and its successful retry both contribute to the denominator.

```sql
SELECT r.release_id,
  ROUND(100.0 * SUM(CASE WHEN t.outcome = 'passed' THEN 1 ELSE 0 END)
    / NULLIF(SUM(CASE WHEN t.outcome IN ('passed', 'failed') THEN 1 ELSE 0 END), 0), 2)
    AS pass_rate_pct
FROM releases r
LEFT JOIN test_runs t ON t.release_id = r.release_id
GROUP BY r.release_id;
```

The visible rates are 66.67 for R14 and 50 for R15. R16 has no rate. Counting run IDs in the denominator agrees on those rows because none is skipped. A release with one pass and one skip should show 100, but that denominator would produce 50. A release with only skips should return `NULL`, which `NULLIF` produces for a zero denominator.

In an interview, explain the difference between a zero rate and an undefined rate. Zero means the release executed tests and none passed. `NULL` means none executed. Multiplying by `100.0` before division keeps this calculation fractional in SQLite, where division of two integers truncates.

See [SQLite arithmetic expressions](https://www.sqlite.org/lang_expr.html) and [aggregate functions](https://www.sqlite.org/lang_aggfunc.html).
