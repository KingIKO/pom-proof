---
title: "Two billing tickets tie for the longest wait. Which tickets count as second place?"
topic: sql
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "If ties share a place, I'd find the next shorter measured wait in each queue. I'd return every ticket at that wait."
looksFor:
  - "Explain why the second ticket in a sorted list may also rank first."
  - "Return both second-place tickets if their waits tie."
  - "Rank measured waits only and keep each queue's results separate."
  - "Explain how a query for ticket IDs differs from a query for the wait value alone."
trap: "Using `RANK` and expecting rank 2 when two tickets tie for first."
followUps:
  - question: "If the product team wants only one link per queue, how would you pick the ticket?"
    answer: "I'd still rank each different wait once. I'd use an agreed rule to pick one ticket at that rank, such as the lowest ticket ID."
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

I'd ask whether both tickets with the longest wait share first place. If they do, I'd use `DENSE_RANK`, which assigns one rank per distinct wait without skipping ranks. Every ticket at the next shorter wait gets rank 2. If the report means the second ticket in a sorted list, I'd use `ROW_NUMBER` to number individual rows. I'd use the ID to break ties in that list.

I'd rank each queue separately and skip tickets with no measured wait. If a queue has no second place, I'd return nothing for it. If I only need one wait value across all queues, I'd use a sorted nested query with `DISTINCT` to remove repeats. I'd use an offset to skip the first result. MySQL 8.4 and PostgreSQL also support `DENSE_RANK`.

### Example

I'd give Billing two tickets at 30 and two at 24. I'd expect the two at 24, IDs 3 and 4. If Delivery has just one known wait, I'd expect no second place there.
