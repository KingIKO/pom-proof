---
problem: sql/latest-executed-run
---

Filter out skipped rows before ranking. Then select rank one per case and keep failures.

```sql
WITH ranked AS (
  SELECT case_id, outcome,
    ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY seq DESC) AS position
  FROM runs
  WHERE outcome <> 'skipped'
)
SELECT cases.name AS name
FROM ranked JOIN cases ON cases.id = ranked.case_id
WHERE ranked.position = 1 AND ranked.outcome = 'failed'
ORDER BY cases.name;
```

The sample returns `checkout` and `pickup`. Ranking before filtering loses any failure followed by a skipped row. Filtering for failures before ranking makes a recovered test look like it still fails.
