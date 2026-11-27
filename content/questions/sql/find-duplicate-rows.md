---
title: "Sam received two welcome emails. Which signup IDs would you put in the bug report?"
topic: sql
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "Keep the raw signup rows visible and count matches by the address the mailing system treats as the same recipient."
looksFor:
  - "Returns the IDs and raw addresses needed to investigate both sends."
  - "Explains why an exact string comparison might miss Sam's duplicate."
  - "Uses a window count to keep rows available for inspection."
  - "Knows when a grouped report should filter with HAVING."
trap: "Returning one normalized address, then assuming it identifies which two rows caused the sends."
followUps:
  - question: "The query returns one signup ID, but two messages still went out. Where would you look next?"
    answer: "I'd check the welcome job or delivery log for two sends tied to that ID. One stored signup can still be processed twice."
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

For the bug report I want both signup IDs and the exact text the service received. I'd count rows with a window function partitioned by the address the mailing system considers equivalent. If the signup contract ignores case and outside spaces, I'd normalize only the comparison key and keep the originals in the output.

For a summary of affected addresses I'd group by that key and use `HAVING COUNT(*) > 1`. `WHERE` filters individual rows before that grouped count is known. SQLite's built-in lowercase conversion is ASCII-only. If the service uses PostgreSQL's locale rules, I'd match that behavior before drawing conclusions about other addresses.

### Example

The fixture contains two spellings of Sam's address and one other signup. The query returns IDs 1 and 2 with two copies each.
