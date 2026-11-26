---
problem: sql/release-test-retry-budget
---

Filter to executed runs, then group by release and case. `WHERE` decides which individual attempts count. `HAVING` checks whether the group has enough of those attempts to merit a report row.

```sql
SELECT release_id, case_id, COUNT(*) AS executed_attempts
FROM test_runs
WHERE outcome IN ('passed', 'failed')
GROUP BY release_id, case_id
HAVING COUNT(*) >= 3;
```

On the visible seed, counting every run row gives the right answer because there are no skips. Only Apply coupon in R14 has three attempts. A failure, a skip and a pass would also group into three rows if the outcome filter were absent. That would flag a case with only two executed attempts. For a case that qualifies anyway, an extra skip would still make the reported count too high.

An interviewer may ask why grouping by case alone changes the result. Attempts in different releases have separate budgets. In the visible data, View refund has two attempts in R14 and one in R15, so neither release should qualify. Test cases with exactly three attempts and cases with the same total split across two releases. The threshold and grouping key need separate examples.

See [SQLite grouping and `HAVING`](https://www.sqlite.org/lang_select.html).
