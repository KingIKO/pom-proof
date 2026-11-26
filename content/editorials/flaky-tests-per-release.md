---
problem: sql/flaky-tests-per-release
---

Start with each failing attempt and look for a later pass. Match both IDs: two releases can run the same case, and two cases can run in the same release. The report describes a release and case pair, so collapse multiple qualifying failure rows for that pair.

```sql
SELECT DISTINCT f.release_id, f.case_id, c.title AS case_title
FROM test_runs f
JOIN test_cases c ON c.case_id = f.case_id
WHERE f.outcome = 'failed' AND EXISTS (
  SELECT 1
  FROM test_runs p
  WHERE p.release_id = f.release_id AND p.case_id = f.case_id
    AND p.outcome = 'passed' AND p.run_id > f.run_id
)
ORDER BY f.release_id, f.case_id;
```

The decoy checks that the same pair has both outcomes. The visible qualifying pairs, Add card in R14 and Save address in R15, happen to fail before passing. If a case only passes before it fails, the decoy still flags it. Requiring the higher `run_id` inside `EXISTS` gives the correct direction without requiring adjacent attempts. An intervening skip therefore changes neither result nor sequence.

An interviewer may ask whether this proves flakiness. The query proves the requested change in outcome. A deploy or data fix between attempts could also cause that change. For triage, test both a pass in the wrong release and multiple passes after a failure. The former must not qualify, and the latter must never duplicate the report row.

See [SQLite `EXISTS`](https://www.sqlite.org/lang_expr.html#the_exists_operator).
