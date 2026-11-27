---
problem: sql/open-critical-defects
---

## What is going on

The triage report describes defects, some filed before anyone links a test case. The title adds context when available. The defect's severity and status decide whether it belongs in the report.

## The fix

```sql
SELECT d.defect_id, d.summary, c.title AS case_title
FROM defects d
LEFT JOIN test_cases c ON c.case_id = d.case_id
WHERE d.severity = 'critical' AND d.status = 'open'
ORDER BY d.defect_id;
```

1. Read from `defects` and left join `test_cases` on `case_id`.

   **Why:** A defect can be actionable before it has a test link. Defect 101 in the altered data has no case ID. An inner join would remove it, whereas a left join gives it a `NULL` title.

2. Require both `d.severity = 'critical'` and `d.status = 'open'` in `WHERE`.

   **Why:** Defect 105 is open but major; defect 103 is critical but `in_progress`. Neither belongs even with a valid case link. The exact status also excludes closed critical defects.

3. Return the ID and summary from the defect and the title from the case.

   **Why:** Defects 102 and 104 point to the same renewal case. Each is still a separate bug with its own summary, so they should not collapse into one row for the case.

4. Sort by `d.defect_id`.

   **Why:** A shared or missing case title cannot determine a unique order among defects. The defect IDs keep the report in the requested ascending order.

## Why the tempting answer fails

The inner join returns defects 11 and 14 on the visible data because both qualifying defects have case links. The unlinked visible defect is minor, so the report excludes it either way. The altered data has an open critical defect about double charges without a case. The inner join drops the defect instead of leaving its title blank.

## What the interviewer listens for

Define `open` as the exact status and separate report eligibility from optional case information. Include both an unlinked critical defect and two defects pointing to the same case when testing.

## Sources

- [SQLite join, filter, and ordering rules](https://www.sqlite.org/lang_select.html)
