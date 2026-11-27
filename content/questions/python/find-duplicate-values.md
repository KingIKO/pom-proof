---
title: Invoice I-17 appears on rows 1, 3, and 6. What should one export failure report?
topic: python
roles: [automation, sdet]
level: junior
type: concept
oneLine: Name I-17 once in the failure, and include any other invoice ID that appeared on more than one row.
looksFor:
  - Reports I-17 once even though it occurs on three rows.
  - Uses set membership to catch a repeat without rereading the export.
  - Estimates memory from the distinct invoice IDs rather than the input iterator alone.
  - Accounts for repeat IDs split across sorted batches of a large export.
trap: Converting the rows to a set before checking them and discarding the evidence of repetition.
followUps:
  - question: The reviewer wants I-17 listed before I-10 because I-17 repeats first on row 3. What would you change?
    answer: Keep the membership sets and append each ID to a result list when it first goes into the repeated set.
sources:
  - label: Python set types
    url: https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset
  - label: Python list sorting
    url: https://docs.python.org/3/tutorial/datastructures.html#more-on-lists
  - label: Python merge of sorted iterators
    url: https://docs.python.org/3/library/heapq.html#heapq.merge
examples:
  - title: Name repeated invoices regardless of export order
    variants:
      - lang: python
        label: Python 3
        code: |
          def repeated_ids(ids):
              seen = set()
              repeats = set()
              for invoice_id in ids:
                  if invoice_id in seen:
                      repeats.add(invoice_id)
                  else:
                      seen.add(invoice_id)
              return repeats


          rows = iter(["I-17", "I-10", "I-17", "I-05", "I-10", "I-17"])
          assert repeated_ids(rows) == {"I-17", "I-10"}
          assert repeated_ids(iter(())) == set()
---

Row 3 is enough to put `I-17` on the failure list. Row 6 shouldn't add another entry.
I'd read the export once, keeping a set of IDs I've seen and a separate set for IDs that
have repeated. I can consume a row iterator without loading the whole export, but the
first set still grows with the number of distinct IDs.

If another check already loaded the rows and doesn't need their order, I'd sort that list
in place and flag adjacent matches. For an overnight export that exceeds memory, I'd save
sorted batches to disk and compare neighbors while merging them. The three `I-17` rows can
start in different batches, so checking each batch on its own would miss some repeats.

### Example

The export has six rows. Invoice `I-17` appears three times and `I-10` twice, so the result contains
both IDs. An empty export has no duplicate IDs.
