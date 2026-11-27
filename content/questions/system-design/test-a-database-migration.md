---
title: Both invoice copies total 2,875 cents. What mismatch would make you hold the cutover?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Look for a missing or changed invoice by ID before trusting matching totals.
looksFor:
  - Uses the missing invoice, extra invoice, and changed amount to explain why matching totals are insufficient.
  - Confirms a rollback keeps an invoice written after the switch.
  - Tests stopping and resuming a large backfill while watching write latency and locks.
  - Checks that both app versions can use the expanded storage without violating invoice constraints.
trap: Matching one row count and assuming the migration preserved every value.
followUps:
  - question: Invoice 505 arrives during the comparison. What makes it fair to compare the two copies?
    answer: I'd compare both copies at a common snapshot or write watermark, then verify later writes caught up before switching readers.
sources:
  - label: Prisma documentation on expand and contract migrations
    url: https://www.prisma.io/docs/guides/database/data-migration
  - label: SQLite common table expressions
    url: https://www.sqlite.org/lang_with.html
  - label: SQLite SELECT, joins, and compound queries
    url: https://www.sqlite.org/lang_select.html
  - label: SQLite IS NOT and NULL comparisons
    url: https://www.sqlite.org/lang_expr.html
examples:
  - title: Find missing, extra, and changed invoice rows
    variants:
      - lang: sql
        label: SQLite (SQL)
        code: |
          WITH before_move(id, cents) AS (VALUES (501, 1250), (502, 900), (503, 725)),
               after_move(id, cents) AS (VALUES (501, 1250), (502, 901), (504, 724)),
               invoice_ids(id) AS (
                 SELECT id FROM before_move
                 UNION
                 SELECT id FROM after_move
               )
          SELECT ids.id, b.cents AS before_cents, a.cents AS after_cents
          FROM invoice_ids AS ids
          LEFT JOIN before_move AS b ON b.id = ids.id
          LEFT JOIN after_move AS a ON a.id = ids.id
          WHERE b.id IS NULL OR a.id IS NULL OR b.cents IS NOT a.cents
          ORDER BY ids.id;
---

I'd hold the cutover if an invoice is missing or has a different amount. Comparing ordered
IDs and values by key range, at the same checkpoint, tells me where to look. I'd use counts
and checksums to narrow the search, then inspect rows and verify uniqueness and required fields.
I'd interrupt and resume a production-sized run while measuring lock waits and write latency.

Before switching reads I'd rehearse what happens to an invoice created after the switch.
The previous app has to read it and still accept new writes. I'd expand the schema alongside
the old storage, run both versions, and delay removal until the rollback window ends. If
recovery calls for restoring a backup, I'd test how to recover the intervening writes.

### Example

The SQLite query uses two snapshots with three unique invoice IDs each and the same total
of 2,875 cents. It should report invoice 502 with the wrong amount, 503 as missing, and
504 as extra. A clean copy returns no rows.
