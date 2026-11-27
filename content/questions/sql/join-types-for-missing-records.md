---
title: "Which join finds paid orders that never got a shipping label?"
topic: sql
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "Start with paid orders, left join qualifying labels, and keep orders whose joined label ID is null."
looksFor:
  - "Explains which unmatched rows each join preserves."
  - "Puts qualifying label filters in the join condition."
  - "Checks a label column that cannot be null on a real row."
  - "Uses fixtures for a missing, a voided, and a valid label."
trap: "Filtering for an active label in WHERE, which drops the very rows with no match."
followUps:
  - question: "What if you also need labels with no order?"
    answer: "In SQLite 3.39 or later a full outer join can show both sides. For a single audit I'd use two separate checks if they have different qualifying rules."
sources:
  - label: SQLite join processing and WHERE filtering
    url: https://www.sqlite.org/lang_select.html
  - label: SQLite 3.39 release notes, new join support
    url: https://www.sqlite.org/releaselog/3_39_0.html
  - label: MySQL 8.4 join syntax
    url: https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/join.html
examples:
  - title: Find orders without an active label
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH orders(id, status) AS (VALUES (11, 'paid'), (12, 'paid'), (13, 'paid')),
               labels(id, order_id, status) AS (VALUES (1, 12, 'void'), (2, 13, 'active'))
          SELECT o.id
          FROM orders AS o
          LEFT JOIN labels AS l ON l.order_id = o.id AND l.status = 'active'
          WHERE o.status = 'paid' AND l.id IS NULL
          ORDER BY o.id;
---

An inner join returns matching orders and labels. For missing labels, I'd start with orders and left join labels. Every order stays in the result and unmatched label columns become null. A right join preserves the right side instead, and a full outer join preserves unmatched rows from both sides. MySQL 8.4 doesn't offer a native full outer join.

I put the label's active status in `ON` so a voided label doesn't count as a match. I use `WHERE` to select paid orders and look for a null in the label's ID, which a real label always has.

### Example

Order 11 has no label, 12 has a voided one, and 13 has an active one. The query returns 11 and 12.
