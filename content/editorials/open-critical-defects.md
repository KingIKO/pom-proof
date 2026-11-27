---
problem: sql/open-critical-defects
---

## What is going on

A triage report helps the team decide which defects to handle first. Some defects are filed before anyone links a test case to them. When a link exists, the test case title adds context. The defect's own severity and status decide whether it belongs in the report.

## The fix

```sql
SELECT d.defect_id, d.summary, c.title AS case_title
FROM defects d
LEFT JOIN test_cases c ON c.case_id = d.case_id
WHERE d.severity = 'critical' AND d.status = 'open'
ORDER BY d.defect_id;
```

1. Read from `defects` and left join `test_cases` on `case_id`.

   **Why:** A defect can need action before it has a test link. A left join keeps every defect, even when no test case matches. An inner join keeps only the defects that have a match. Defect 101 in the altered data has no case ID, so an inner join would remove it. A left join keeps it and gives it a `NULL` title, which means no value.

2. Require both `d.severity = 'critical'` and `d.status = 'open'` in `WHERE`.

   **Why:** Defect 105 is open, but its severity is major. Defect 103 is critical, but its status is `in_progress`. Neither one belongs in the report, even with a valid case link. The exact status check also leaves out closed critical defects.

3. Return the ID and summary from the defect and the title from the case.

   **Why:** Defects 102 and 104 point to the same renewal case. Each one is still a separate bug with its own summary. So the report shows two rows for them, not one row for the case.

4. Sort by `d.defect_id`.

   **Why:** Two defects can share a case title, and some defects have no title at all. So the title cannot give each defect a unique place in the order. The defect IDs keep the report in the requested ascending order.

## Why the tempting answer fails

The decoy uses an inner join. On the visible data, it returns defects 11 and 14, because both qualifying defects have case links. The visible defect without a link is minor, so the report leaves it out either way. The altered data has an open critical defect about double charges that has no case. The inner join drops that defect instead of showing it with a blank title.

## What the interviewer listens for

Define `open` as the exact status value. Keep the rule that decides which defects belong apart from the optional case information. When you test, include a critical defect with no linked case. Also include two defects that point to the same case.

## Sources

- [SQLite join, filter, and ordering rules](https://www.sqlite.org/lang_select.html)
