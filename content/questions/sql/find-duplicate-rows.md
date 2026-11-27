---
title: "Sam received two welcome emails. Which signup IDs would you put in the bug report?"
topic: sql
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "I keep the original signup rows and count addresses that the mailing system treats as the same recipient."
looksFor:
  - "Return the IDs and original addresses to investigate both sends."
  - "Explain why comparing addresses character for character may miss Sam's duplicate."
  - "Count matches with a window function so you can still inspect each row."
  - "Explain when to use `HAVING` to filter a grouped report."
trap: "Returning one normalized address and assuming it identifies the two rows that caused the sends."
followUps:
  - question: "The query returns one signup ID, but two messages still went out. Where would you look next?"
    answer: "I'd look in the welcome job or the delivery log for two sends tied to that ID. The job can process one stored signup twice."
sources:
  - label: SQLite grouping and HAVING
    url: https://www.sqlite.org/lang_select.html
  - label: SQLite lower and trim functions
    url: https://www.sqlite.org/lang_corefunc.html
  - label: SQLite aggregate window functions
    url: https://www.sqlite.org/windowfunctions.html
  - label: PostgreSQL string functions and locale rules
    url: https://www.postgresql.org/docs/current/functions-string.html
examples:
  - title: Return both rows in a repeated signup group
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH signups(id, email) AS (
            VALUES (1, ' Sam@example.test '), (2, 'sam@example.test'), (3, 'jo@example.test')
          ), keyed AS (
            SELECT id, email, LOWER(TRIM(email)) AS email_key FROM signups
          ), counted AS (
            SELECT *, COUNT(*) OVER (PARTITION BY email_key) AS copies FROM keyed
          )
          SELECT id, email, copies FROM counted WHERE copies > 1 ORDER BY id;
---

For the bug report, I want both signup IDs and the exact address text the service received. I'd use a window function to count the rows for each equivalent address and still return each original row. If the signup rules ignore letter case and spaces at either end, I'd normalize only the comparison key. That means I put equivalent addresses in one form for comparison and keep the original text in the output.

For a summary of affected addresses, I'd group by that key and use `HAVING COUNT(*) > 1` to keep groups with duplicates. `WHERE` filters individual rows before the query knows the count for each group. SQLite's built-in lowercasing works only on ASCII. If the service uses PostgreSQL's locale rules, I'd match those rules before drawing conclusions about other addresses.

### Example

My test data contains two spellings of Sam's address and one other signup. I'd expect the query to return IDs 1 and 2, each with a count of two.
