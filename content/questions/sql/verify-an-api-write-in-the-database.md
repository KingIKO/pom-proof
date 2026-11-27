---
title: "Case 45 appears open, but the returns worker skips it. What would you check in the database?"
topic: sql
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd look for case 45's saved status and first history event, even if the API already shows the case as open."
looksFor:
  - "Check whether the database stores `open` or the API supplies it when the value is missing."
  - "Use the ID 45 from the create reply to match the case with its first history event."
  - "Compare the saved reason and time with the values set up for the test."
  - "Wait until the database should have saved the change before calling it missing."
trap: "Using the API reply to explain a worker that reads the saved status from the database."
followUps:
  - question: "Case 45 shows as open at 10:30 UTC, but the query has no event value. What would you check next?"
    answer: "I'd read all history rows for case 45. I'd check whether the opened event is missing or appears at the wrong position. This query matches only position 1."
sources:
  - label: RFC 9110, 201 Created
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.2
  - label: SQLite joins and result columns
    url: https://www.sqlite.org/lang_select.html
examples:
  - title: Read the saved case and its first history row
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH cases(id, order_id, reason, status, created_at) AS (
            VALUES (45, 901, 'damaged', 'open', '2026-11-27T10:30:00Z')
          ), history(case_id, position, event) AS (VALUES (45, 1, 'opened'))
          SELECT c.order_id, c.reason, c.status, c.created_at, h.event
          FROM cases AS c
          LEFT JOIN history AS h ON h.case_id = c.id AND h.position = 1
          WHERE c.id = 45;
---

I'd check what the worker, the program that processes returns, reads from the database. The API might show `open` when the saved status is missing. I'd use the ID from the create reply to find the case row. Once the database should have committed, or saved, the write, I'd check the stored status. I'd join the case to its first history event by matching rows for the same case.

I'd use a read-only connection to avoid changing the data. I'd compare the saved reason with the one I sent. To check the saved time, I'd set the server clock to a known value or agree on a time range. I'd specify the time zone and how precisely to compare the time. If I only need to show that customers can reopen the case, I'd normally read it through the API.

### Example

I'd set up the saved results for case 45 on order 901. If the test clock reads 10:30 UTC, I'd expect that time, reason `damaged`, and status `open`. I'd expect the first history row to say `opened`.
