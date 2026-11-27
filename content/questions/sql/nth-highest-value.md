---
title: "Two billing tickets tie for the longest wait. Which tickets belong on the runner-up report?"
topic: sql
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "Use the next distinct measured wait for each queue and return all tickets at that wait if the report gives ties the same place."
looksFor:
  - "Works out why the second billing ticket in sort order may still be in first place."
  - "Returns both runner-up tickets when their waits tie."
  - "Does not borrow a runner-up from another queue or rank an unmeasured wait."
  - "Distinguishes the query needed to report ticket IDs from the one needed to report just a wait value."
trap: "Using RANK and expecting rank 2 to exist when two rows are tied for first."
followUps:
  - question: "Product wants only one ticket link per queue. How would you choose it?"
    answer: "I'd preserve the distinct-wait rank, then pick one of the tickets at that rank using an agreed tie-breaker such as the lowest ticket ID."
sources:
  - label: SQLite ranking window functions
    url: https://www.sqlite.org/windowfunctions.html
  - label: SQLite DISTINCT, ORDER BY and LIMIT
    url: https://www.sqlite.org/lang_select.html
  - label: PostgreSQL window function reference
    url: https://www.postgresql.org/docs/current/functions-window.html
  - label: MySQL 8.4 window function reference
    url: https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/window-function-descriptions.html
examples:
  - title: Keep every ticket tied at its queue's second distinct wait
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH tickets(id, queue, minutes) AS (
            VALUES (1, 'billing', 30), (2, 'billing', 30), (3, 'billing', 24),
                   (4, 'billing', 24), (5, 'delivery', 18), (6, 'delivery', NULL)
          ), ranked AS (
            SELECT *, DENSE_RANK() OVER (PARTITION BY queue ORDER BY minutes DESC) AS place
            FROM tickets
            WHERE minutes IS NOT NULL
          )
          SELECT id, queue, minutes FROM ranked WHERE place = 2 ORDER BY queue, id;
---

I'd ask whether the report gives both longest-wait tickets first place. If it does, the runner-up is the next distinct wait. `DENSE_RANK` gives every ticket at that wait rank 2. I'd use `ROW_NUMBER` with an ID tie-breaker only if the report instead means the second ticket in a sorted list.

Each queue gets its own ranks. I'd skip unmeasured tickets and let a queue without a runner-up return nothing. If the report only needs one distinct value across all queues, a sorted `DISTINCT` subquery with an offset also works. MySQL 8.4 and PostgreSQL support `DENSE_RANK` too.

### Example

Billing has two tickets tied at 30 and two at 24. The query returns the two at 24, IDs 3 and 4. Delivery has only one known wait, so it has no second place.
