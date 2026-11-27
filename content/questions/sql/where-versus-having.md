---
title: "How would you find which stores had two or more pickup failures this week?"
topic: sql
roles: [manual-qa, automation]
level: mid
type: tooling
oneLine: "I'd use `WHERE` to keep failed pickups from this week. After grouping by store, I'd use `HAVING` to keep stores with at least two."
looksFor:
  - "Filter each pickup by its status and date."
  - "Group the remaining pickups by store ID."
  - "Use `HAVING` to check the count for each store."
  - "Set up test data that reveals a missing date or status filter."
trap: "Counting all pickups per store and using that total to flag repeat failures."
followUps:
  - question: "How would you count customers who had a failed pickup rather than counting the failures?"
    answer: "After filtering, I'd use `COUNT(DISTINCT customer_id)` to count each customer once. I'd add two failures for one customer to check that the count goes up by one."
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

I'd use `WHERE` to filter individual pickups before I count them. A pickup must have a failed status. Its date must also fall inside the report week. I'd group the remaining rows by store. I'd use `HAVING` to filter the groups using the pickup count for each store.

I'd set up one store right at the cutoff and another just below it. For the second store, I'd add an older failure and a successful pickup from this week. If the query leaves out either filter, that store appears even though it shouldn't.

### Example

I'd use dates without times for the week starting November 23. I'd expect the query to show store 8 with two failures and leave out store 9.
