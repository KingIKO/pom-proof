---
title: "Case 45 reads as open, but the returns worker skips it. Which rows would you inspect?"
topic: sql
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Check whether case 45 actually stores its open status and first history event, even if the read API already shows the case as open."
looksFor:
  - "Tests whether the worker sees a saved `open` value or a missing default the API filled in."
  - "Uses case 45 from the create response to connect the case to its first history event."
  - "Keeps the expected reason and timestamp tied to the fixture."
  - "Waits for the promised commit rather than treating an early database read as a lost write."
trap: "Using the read API's displayed status to explain a worker that reads the stored column."
followUps:
  - question: "Case 45 is open at 10:30 UTC, but the query returns null for its event. What would you check next?"
    answer: "I'd look for the history rows tied to case 45 and check whether the opened event was omitted or saved at the wrong position. The query only joins position 1."
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

I'd check what the worker actually sees. The API might supply `open` when the saved status is missing, so I'd read the case row by the ID returned by the create request. Once the write should be committed, I'd check the stored status and join the first history event to the case.

I'd use a read-only connection and compare the saved reason with the submitted reason. To check the saved timestamp I'd use a fixed server clock or an agreed time range with a known timezone and precision. If I only needed to prove customers could reopen the case view, I'd normally read it through the API.

### Example

The fixture represents the stored result for case 45 on order 901. With the test clock set to 10:30 UTC, I expect `damaged`, `open` and that timestamp. The first history row should say `opened`.
