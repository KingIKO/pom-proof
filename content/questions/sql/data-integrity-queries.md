---
title: "Invoice 1 stores a total of 100, but its two lines add to 40. What should the backfill report tell you?"
topic: sql
roles: [sdet, senior]
level: senior
type: tooling
oneLine: "Report the total mismatch and any separate defects on invoice 1 without hiding failures on other invoices."
looksFor:
  - "Calculates the expected amount from invoice 1's lines in minor units."
  - "Keeps the repeated SKU and missing currency visible as separate findings."
  - "Starts from lines when looking for a missing invoice, so a bad reference like 9 can appear."
  - "Checks the report both with known violations and with clean data before using it for sign-off."
trap: "Using NOT IN against a nullable column, which can turn a missing match into unknown."
followUps:
  - question: "The backfill fixes invoice 1's total, but its currency is still missing. What should CI show?"
    answer: "The total mismatch should disappear. The missing-currency row must stay in the report and still fail CI. I'd publish the rule and test invoice ID without copying private invoice details."
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

I'd give invoice 1 a row for each failed rule. Fixing the total shouldn't make the missing currency disappear from the report. Nor should it clear the repeated pen line if the contract allows only one row per SKU. A backfill can preserve the row count and produce all of those defects.

I'd check from the line table when looking for references like invoice 9. `NOT EXISTS` finds lines with no matching invoice even if the inspected data contains nulls. A null in a `NOT IN` subquery can hide an unmatched line. I'd run the report on clean data and on planted defects before using an empty result as a release check.

### Example

The query finds the orphan line for invoice 9. It reports three problems on invoice 1: a repeated SKU, a missing currency and a total mismatch. Invoice 2 passes.
