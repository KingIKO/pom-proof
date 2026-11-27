---
title: "Support sees postcode 2108 on an order. How would you find where the first zero went missing?"
topic: sql
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: "I'd use the same order ID to compare the postcode in the saved address, the API reply, and the screen."
looksFor:
  - "Use a postcode that starts with zero so you can see if it disappears."
  - "Before comparing values, check that the order points to the right address."
  - "Find the first place where the value differs from the one you entered."
  - "Use the exact test order ID and keep the database reads separate from setting up test data."
trap: "Reading the latest address instead of the one the order screen uses."
followUps:
  - question: "Another tester saves a different address during your test. How would you make sure you read the right one?"
    answer: "I'd use an order just for my test. I'd use its ID when I check the screen, API, and database. Before comparing postcodes, I'd check the linked address ID."
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

I'd save a test order with a postcode that starts with zero and keep its ID. Before checking how the screen formats the value, I'd use SQL to read the saved order and find the address it points to. If the right address contains `2108`, I'd check how the app saved it. If it contains `02108`, I'd compare the API reply with what the screen shows.

I'd also use SQL to find an order I can edit before trying to repeat the problem. If I need to set up records, I'd write them to a database I can throw away. I'd use a read-only connection to investigate the problem.

### Example

I'd expect order 71 to point to address 8 in Boston. I'd expect the query to return `02108` with the first zero intact. If the screen shows `2108`, I'd look for where the app turned the text into a number.
