---
title: Invoice I-17 appears on rows 1, 3, and 6. How should the export check report it?
topic: python
roles: [automation, sdet]
level: junior
type: concept
oneLine: I'd list I-17 once. I'd also list each other invoice ID that appears on more than one row.
looksFor:
  - Report I-17 once even though it appears on three rows.
  - Use a set to spot an ID you've already seen without reading any rows again.
  - Estimate memory from how many different IDs you store, even if you read rows one at a time.
  - Catch repeats even when the same ID appears in different sorted batches.
trap: Putting all the rows in a set first and losing the repeats before you can report them.
followUps:
  - question: I-17 repeats first on row 3. How would you list it before I-10?
    answer: I'd keep both sets. When an ID first goes into the repeat set, I'd also add it to the end of the result list.
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

I'd report `I-17` when I see it again on row 3. I wouldn't list it again on row 6. I'd read the export once and keep two sets, collections that store each value only once. One set tracks every ID I've seen, and the other tracks repeats. Reading from an iterator gives me one row at a time, but the first set still grows with the number of different IDs.

If another check already loaded the rows and doesn't need their order, I'd sort that same list and compare neighboring rows. If an overnight export won't fit in memory, I'd sort batches and save them to disk. I'd merge the batches and compare neighboring IDs as I go. If the three `I-17` rows start in different batches, checking each batch alone would miss those repeats.

### Example

I'd use six export rows, with `I-17` three times and `I-10` twice. I'd expect the result to list each of those IDs once. If I pass an empty export, I'd expect no duplicate IDs.
