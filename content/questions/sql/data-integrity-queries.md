---
title: "Invoice 1 stores a total of 100, but its two lines add up to 40. What should the backfill report show?"
topic: sql
roles: [sdet, senior]
level: senior
type: tooling
oneLine: "I'd report the wrong total and any other broken rules on invoice 1. I'd still report failures on other invoices."
looksFor:
  - "Add up invoice 1's line amounts in the currency's smallest unit."
  - "Report the repeated product code and the missing currency separately."
  - "Start with invoice lines so the query can find a reference to a missing invoice such as 9."
  - "Try the report on clean data and on data with known problems before using it for release."
trap: "Using `NOT IN` on values that may be null, so the query can treat a missing match as unknown."
followUps:
  - question: "The backfill fixes invoice 1's total but leaves its currency missing. What should the automated check show?"
    answer: "I'd expect the total complaint to disappear. The missing currency must still appear and fail the job. I'd publish the rule and test invoice ID without copying private details."
sources:
  - label: SQLite NOT IN and EXISTS behavior
    url: https://www.sqlite.org/lang_expr.html
  - label: SQLite grouping and compound queries
    url: https://www.sqlite.org/lang_select.html
  - label: SQLite aggregate functions
    url: https://www.sqlite.org/lang_aggfunc.html
examples:
  - title: Report four kinds of backfill violations
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH invoices(id, total, currency) AS (VALUES (1, 100, NULL), (2, 50, 'USD')),
               lines(invoice_id, sku, amount) AS (
                 VALUES (1, 'pen', 20), (1, 'pen', 20), (2, 'book', 50), (9, 'bag', 30)
               )
          SELECT 'orphan' AS rule, l.invoice_id AS record_id
          FROM lines AS l
          WHERE NOT EXISTS (SELECT 1 FROM invoices AS i WHERE i.id = l.invoice_id)
          UNION ALL
          SELECT 'duplicate_sku', invoice_id FROM lines GROUP BY invoice_id, sku HAVING COUNT(*) > 1
          UNION ALL
          SELECT 'missing_currency', id FROM invoices WHERE currency IS NULL
          UNION ALL
          SELECT 'wrong_total', i.id
          FROM invoices AS i
          LEFT JOIN lines AS l ON l.invoice_id = i.id
          GROUP BY i.id, i.total
          HAVING i.total <> COALESCE(SUM(l.amount), 0)
          ORDER BY rule, record_id;
---

I'd use the report to check a backfill, a job that fills in or changes existing records. I'd give invoice 1 one result row per broken rule. If the total gets fixed, the missing currency should still appear. If the rules allow only one row per SKU, or product code, the repeated pen line should still appear too. A backfill can leave the row count unchanged and still cause all these problems.

I'd start with the line table to find references to missing invoices like 9. The `NOT EXISTS` condition finds lines without a matching invoice even if some values are null, meaning absent. If a nested query returns a null, `NOT IN` can leave out an unmatched line. Before treating an empty report as a pass, I'd run it with clean data and with known faults.

### Example

I'd expect the query to find a line with no matching invoice 9. I'd expect three rows for invoice 1, one each for the repeated SKU, missing currency, and wrong total. I'd expect no problem for invoice 2.
