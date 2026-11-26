---
problem: sql/open-critical-defects
---

Read from defects and use a left join to add the test case title. The defect's severity and status determine whether it belongs in the report. Its case link only supplies extra context.

```sql
SELECT d.defect_id, d.summary, c.title AS case_title
FROM defects d
LEFT JOIN test_cases c ON c.case_id = d.case_id
WHERE d.severity = 'critical' AND d.status = 'open'
ORDER BY d.defect_id;
```

The inner join returns defects 11 and 14 on the visible data, just like the reference, because both qualifying defects have a case. The unlinked defect in that data is minor, so it doesn't expose the mistake. An unlinked open critical defect would disappear from the inner join. The left join preserves it and returns `NULL` for its title. Several defects can point to the same case and should still appear as separate rows.

Define open explicitly, since some teams use that word for anything unresolved. Here it is the exact status value. Check both an `in_progress` critical defect and a closed critical defect to show that neither slips through. Then try an unlinked open critical defect and multiple open critical defects linked to one test case.

See the [SQLite join and filter rules](https://www.sqlite.org/lang_select.html).
