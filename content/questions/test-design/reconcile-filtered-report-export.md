---
title: How would you check that a filtered CSV export includes exactly the records it should?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: I'd work out which test records belong in the file without using the report. I'd check their IDs and values across every result page.
looksFor:
  - Check which records the export covers and what point in time it represents.
  - Set up records you know the file should include or leave out.
  - Compare IDs, important values, and totals with the records you expect.
  - Test results that span several pages and a filter that matches nothing.
trap: Opening the file and checking only that its row count matches the first report page.
followUps:
  - question: If the row count and total match, what can checking the IDs still tell you?
    answer: If one row is missing and another with the same amount appears twice, the count and total can still match. I'd count rows per ID to see exactly what the file contains.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.1, representative input groups
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: SQLite SELECT and UNION ALL
    url: https://www.sqlite.org/lang_select.html
examples:
  - title: Find missing and duplicate IDs
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH expected(id) AS (VALUES (101), (102), (103), (104)),
               exported(id) AS (VALUES (101), (101), (103), (104)),
               counts AS (
                 SELECT id, 1 AS wanted, 0 AS actual FROM expected
                 UNION ALL
                 SELECT id, 0, 1 FROM exported
               )
          SELECT id, SUM(wanted) AS expected_count, SUM(actual) AS actual_count
          FROM counts
          GROUP BY id
          HAVING SUM(wanted) <> SUM(actual)
          ORDER BY id;
---

I'd check whether the export is meant to include every match or only the current page. If the job runs in the background, I'd agree on what point in time its data should represent.

I'd set up a few records so I can work out what belongs in the file without the report. I'd include matches on several pages and records just outside the filter. I'd also test a filter that matches nothing. In the downloaded file, I'd compare IDs, counts, and values the user relies on. If the export rules require a date or amount format, I'd check that too.

### Example

I'd test a branch manager exporting approved expenses across all pages. I'd set up four approved claims for $25, $25, $37, and $50, plus a pending one. I'd set the page size to two. I'd expect the CSV, or comma-separated values file, to contain each approved ID once and leave out the pending claim.

If the export duplicates one $25 claim and leaves out the other $25 claim, the total could still be $137. I'd expect the query to report both problems. Claim 101 appears twice and claim 102 is missing.
