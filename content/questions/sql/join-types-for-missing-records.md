---
title: "Which SQL join finds paid orders without a valid shipping label?"
topic: sql
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "I'd start with paid orders and use a left join to match active labels. I'd keep orders whose matching label ID is null."
looksFor:
  - "Say which rows each join keeps when they have no match."
  - "Put the active label check in the join condition."
  - "Check a column that always has a value on a real label row."
  - "Test orders with no label, a voided label, and an active label."
trap: "Checking for an active label in `WHERE`, which removes orders with no match."
followUps:
  - question: "How would you also find labels that have no matching order?"
    answer: "In SQLite 3.39 or later, I'd use a full outer join to see unmatched rows on both sides. If each side has different rules, I'd use two checks in the same audit."
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

I'd use an inner join if I only wanted orders and labels that match. To find missing labels, I'd start with orders on the left and use a left join. It keeps every order and fills the label columns with null, or no value, if there's no match.

A right join keeps unmatched rows on the right instead. A full outer join keeps unmatched rows from both sides. MySQL 8.4 doesn't have a built-in full outer join.

I'd check active status in `ON`, the part of the join that decides which rows match. A voided label then won't count as a match. I'd use `WHERE`, which filters the resulting rows, to keep paid orders with a null label ID. A real label always has an ID.

### Example

I'd give order 11 no label and order 12 a voided label. I'd give order 13 an active label. I'd expect the query to return 11 and 12.
