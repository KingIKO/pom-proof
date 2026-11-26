---
problem: sql/slowest-test-per-suite
---

Join each run to its suite through the case and rank measured runs within that suite. Sorting the window by duration alone gives equal durations equal rank. Keeping rank one returns every run sharing that suite's maximum.

```sql
WITH ranked AS (
  SELECT c.suite, c.case_id, r.run_id, r.duration_ms,
    RANK() OVER (PARTITION BY c.suite ORDER BY r.duration_ms DESC) AS position
  FROM test_cases c JOIN test_runs r ON r.case_id = c.case_id
  WHERE r.duration_ms IS NOT NULL
)
SELECT suite, case_id, run_id, duration_ms
FROM ranked WHERE position = 1
ORDER BY suite, run_id;
```

The `ROW_NUMBER()` answer is a good fit for a report that needs one winner and a tie rule. Here it returns only one run per suite, even if several measurements are equally slow. It agrees on the visible data because payments and delivery each have a single slowest run. Search has no measured run, so it is absent. The final sort by run ID orders tied results without changing their ranks.

An interviewer may ask why the query ranks runs rather than cases. A case can have multiple attempts worth investigating, and collapsing them into one case row would lose that evidence. Test a suite with a repeated maximum from both the same case and a different case. All measured runs at that maximum should appear.

See [SQLite ranking functions](https://www.sqlite.org/windowfunctions.html).
