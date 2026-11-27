---
title: The export check reads INV-43 by row number. Which Java list fits that access pattern?
topic: java
roles: [sdet]
level: mid
type: concept
oneLine: Store the invoice IDs in an ArrayList so the check can append each row and read the second one directly.
looksFor:
  - Uses the check for INV-43 to explain constant-time indexed access.
  - Allows for the occasional backing array resize as invoice rows arrive.
  - Accounts for node traversal when retrieving an export row by index from a LinkedList.
  - Separates editing at an iterator from a queue that only uses the ends.
trap: Choosing LinkedList for fast insertion at a numeric index without counting the traversal needed to reach it.
followUps:
  - question: The export helper's ListIterator is already positioned before INV-43 and needs to insert a correction there. What work would a LinkedList avoid?
    answer: The iterator already has the position. Inserting there changes links instead of shifting the remaining invoice rows in an array.
sources:
  - label: Java 21 ArrayList
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html
  - label: Java 21 LinkedList
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedList.html
  - label: Java 21 ArrayDeque
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html
examples:
  - title: Check a known row in an ordered export
    variants:
      - lang: java
        label: Java 21
        code: |
          import java.util.ArrayList;
          import java.util.List;

          class ExportOrderCheck {
              public static void main(String[] args) {
                  List<String> ids = new ArrayList<>();
                  ids.add("INV-21");
                  ids.add("INV-43");
                  ids.add("INV-50");
                  if (!ids.get(1).equals("INV-43")) {
                      throw new AssertionError("Unexpected second invoice: " + ids.get(1));
                  }
              }
          }
---

The assertion calls `get(1)` after collecting the IDs. I'd use an `ArrayList` so that read
can go straight to an array slot in constant time. Appending is amortized constant time,
so appending all rows takes linear time even though some appends trigger a resize.

`LinkedList` has links in both directions. It can add or remove at either end without shifting
an array, but an indexed read walks nodes from the closer end. I'd consider it if the check
frequently edits at a position it's already reached with an iterator. For a job queue where
I only care about the ends, I'd start with `ArrayDeque`.

### Example

An export fixture gives me three invoice IDs in order. I'd append them to an `ArrayList`
and check that the second row is invoice `INV-43`.
