---
problem: sql/release-cases-without-execution
---

Start with the plan so that unplanned runs cannot introduce report rows. For each planned pair, ask whether the run table contains an executed attempt for that exact release and case. One match is enough to remove the pair from the gap report.

```sql
SELECT p.release_id, p.case_id
FROM release_cases p
WHERE NOT EXISTS (
  SELECT 1
  FROM test_runs t
  WHERE t.case_id = p.case_id AND t.release_id = p.release_id
    AND t.outcome IN ('passed', 'failed')
);
```

The decoy checks the case ID alone. It works on the visible data because planned cases with no execution have no executions in other releases either. If the same case passes in R22 after being skipped in R21, R21 still has a gap. The decoy hides it by treating the later release's pass as coverage everywhere. The reference counts a failed attempt as execution because this is a coverage report, separate from a pass report.

In an interview, name the two IDs as the report key and explain why skipped rows must never satisfy the subquery. An equivalent left join has to filter for passed or failed runs in its `ON` clause before looking for a missing run ID.

See [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator) and [outer joins](https://www.sqlite.org/lang_select.html).
