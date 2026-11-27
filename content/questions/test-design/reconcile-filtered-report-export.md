---
title: How would you prove a filtered CSV export contains the right records?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Use seeded records to compute the expected set independently, then compare exported IDs and values across all result pages.
looksFor:
  - Confirms the scope of the export and the time represented by its data.
  - Builds a known set of included and excluded records.
  - Compares identifiers, important field values, and totals.
  - Covers a multi-page result and a filter with no matching records.
trap: Checking that the file opens and has the same row count as the first page of the report.
followUps:
  - question: Why check IDs if the row count and total already match?
    answer: A missing row and a duplicate with the same amount could cancel each other out. Comparing IDs and their counts tells me which records actually made it into the file.
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

I'd confirm whether the export is meant to include every filtered record or only the current page. I'd also agree on which point in time the file should represent if the job runs in the background.

Then I'd make a small set of records where I can work out the answer without using the report. I'd include matching records across pages, records just outside the filter, and an empty result case. In the downloaded file I'd check IDs, counts, and the values the user relies on. If dates or amounts have a particular format, I'd compare them against the export contract.

### Example

A branch manager exports approved expenses across all pages. I seed four approved claims for $25, $25, $37, and $50, plus a pending claim, and use a page size of two. The CSV should contain each approved ID exactly once and exclude the pending claim. A duplicated $25 claim could leave the total at $137 if the other $25 claim went missing. The query reports both mismatches: claim 101 appears twice, and claim 102 is missing.
