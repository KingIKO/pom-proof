---
title: "Support sees postcode 2108 for an order. What evidence would tell you where the zero was lost?"
topic: sql
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: "Use the same order ID to trace the postcode from the linked address through the API response to the screen."
looksFor:
  - "Uses a postcode with a leading zero so the defect is visible."
  - "Checks whether the order points to the intended address before comparing values."
  - "Identifies the first layer whose value differs from the input."
  - "Uses an exact fixture ID and keeps diagnostic reads separate from test data setup."
trap: "Querying the latest address row instead of the one the order screen reads."
followUps:
  - question: "Another tester saved a different address while you were reproducing the issue. How do you avoid mixing up the reads?"
    answer: "Use a dedicated test order. Keep its ID from setup through the screen, API and database reads, and check the linked address ID before comparing the postcode."
sources:
  - label: SQLite SELECT, joins and row filters
    url: https://www.sqlite.org/lang_select.html
  - label: SQLite common table expressions
    url: https://www.sqlite.org/lang_with.html
examples:
  - title: Inspect the delivery address by order ID
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH orders(id, delivery_address_id) AS (VALUES (71, 8), (72, 9)),
               addresses(id, postcode, city) AS (
                 VALUES (8, '02108', 'Boston'), (9, '98101', 'Seattle')
               )
          SELECT o.id, o.delivery_address_id, a.postcode, a.city
          FROM orders AS o
          LEFT JOIN addresses AS a ON a.id = o.delivery_address_id
          WHERE o.id = 71;
---

I'd reproduce the save on a test order with a leading-zero postcode and keep the order ID. Before blaming formatting, I'd query the order and check which address it actually points to. If it points to the right row but storage has `2108`, I'd look at the write path. If storage has `02108`, I'd compare the API response with the screen to see where they diverge.

SQL also helps me find an editable order before reproducing the defect. I'd prepare data in a disposable database when I need to write it and use a read-only connection for diagnosis.

### Example

Order 71 should point to address 8 in Boston. The query returns `02108`, including the leading zero. If the screen shows `2108`, I'd check where the string became a number.
