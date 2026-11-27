---
title: "How would you find stores with at least two failed pickups this week?"
topic: sql
roles: [manual-qa, automation]
level: mid
type: tooling
oneLine: "Use WHERE to select the failed pickups in the date range, then use HAVING to keep stores with enough matching rows."
looksFor:
  - "Uses a row filter for status and date."
  - "Groups by the store identifier."
  - "Uses HAVING to compare the count after grouping."
  - "Uses fixtures that would catch a missing date or status filter."
trap: "Counting every pickup for each store and using the resulting total to flag repeat failures."
followUps:
  - question: "What if the report should count unique customers who hit a failure?"
    answer: "I'd use COUNT(DISTINCT customer_id) after filtering and include two failures from one customer to prove they count once."
sources:
  - label: SQLite SELECT processing
    url: https://www.sqlite.org/lang_select.html
  - label: SQLite count and DISTINCT aggregates
    url: https://www.sqlite.org/lang_aggfunc.html
examples:
  - title: Filter failed pickups, then apply the minimum count
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH pickups(store_id, day, status) AS (
            VALUES (8, '2026-11-23', 'failed'), (8, '2026-11-24', 'failed'),
                   (8, '2026-11-25', 'picked_up'), (9, '2026-11-24', 'failed'),
                   (9, '2026-11-22', 'failed'), (9, '2026-11-25', 'picked_up')
          )
          SELECT store_id, COUNT(*) AS failures
          FROM pickups
          WHERE status = 'failed' AND day >= '2026-11-23' AND day < '2026-11-30'
          GROUP BY store_id
          HAVING COUNT(*) >= 2;
---

I use `WHERE` for rules I can apply to one pickup at a time. In this case a pickup must be marked failed and its date must fall inside the report week. I then group the remaining rows by store. `HAVING` can check the count that comes out of each group.

I'd seed a store at the cutoff and one below it. For the store below it I'd include an older failure and a successful pickup in the current week. Either row would make that store appear incorrectly if the report missed a filter.

### Example

The fixture uses date-only values for the week starting November 23. The query returns store 8 with two failures and omits store 9.
