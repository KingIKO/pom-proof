---
title: Both invoice copies total 2,875 cents. What difference would make you delay the switch?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Before I trust matching totals, I'd compare invoices by ID to find any missing or changed rows.
looksFor:
  - Explain how a missing invoice, an extra invoice, and a changed amount can leave the total unchanged.
  - Check that switching back keeps an invoice created after the switch.
  - Stop and resume a large backfill while measuring how long writes and waits for locks take.
  - Check that both app versions can use the new storage layout and still follow the invoice rules.
trap: Seeing the same row count and assuming the move kept every value.
followUps:
  - question: Invoice 505 arrives during the comparison. How would you compare the copies at the same point in time?
    answer: I'd use a common snapshot or a marker for the last write included. Before switching readers, I'd check that the new copy caught up with later writes.
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

If an invoice is missing or its amount changed, I'd delay the cutover, the switch to the new copy. At the same checkpoint for both copies, I'd compare IDs and values in sorted ranges. I'd narrow the search with counts and checksums, short values calculated from the data. Then I'd inspect rows for duplicate IDs and missing required fields.

I'd stop and resume a backfill, a job that copies or fills in existing records, with production-sized data. I'd measure how long writes take and how long they wait for locks that protect data during changes.

Before switching readers, I'd rehearse what happens to an invoice created after the switch. The previous app must be able to read it and still accept writes. I'd expand the schema, the database's layout, while keeping the old storage. I'd run both app versions. I'd wait until the rollback window, the period when we can switch back, ends before removing the old storage.

If recovery requires a backup, I'd test how to recover writes made since that backup.

### Example

I'd give the SQLite query two snapshots, or copies from one point in time. Each has three unique invoice IDs and totals 2,875 cents. I'd expect 502 to show the wrong amount and 503 to show as missing. I'd expect 504 to show as extra. If the copy is correct, I'd expect no result rows.
