---
title: Which Java list would you use if the export test looks up INV-43 by row number?
topic: java
roles: [sdet]
level: mid
type: concept
oneLine: I store the invoice IDs in an `ArrayList`. The check can then append each row and read the second one directly.
looksFor:
  - Use the check for INV-43 to explain constant-time indexed access.
  - Allow for the occasional resize of the backing array as invoice rows arrive.
  - Count the node-by-node walk when a `LinkedList` retrieves an export row by index.
  - Tell editing at an iterator's position apart from a queue that only uses the ends.
trap: Choosing `LinkedList` for fast insertion at a numeric index without counting the walk through nodes needed to reach it.
followUps:
  - question: The export helper's `ListIterator` is already positioned before INV-43 and needs to insert a correction there. What work would a `LinkedList` avoid?
    answer: I'd use the position the iterator already holds. If I insert there, the list changes links between entries. An array would have to shift the remaining invoice rows.
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

The assertion calls `get(1)` after collecting the IDs. An `ArrayList` keeps its items in a backing array. I'd use one so that read can go straight to an array slot in constant time. Constant time means the cost stays the same however long the list grows.

Appending is amortized constant time, which means constant on average across many appends. So appending all rows takes linear time, growing in step with the row count. That holds even though some appends trigger a resize.

`LinkedList` stores each item in a node with links in both directions. It can add or remove at either end without shifting an array. But an indexed read walks nodes from the closer end. If the check frequently edits at a position it's already reached with an iterator, I'd consider it.

For a job queue where I only care about the ends, I'd start with `ArrayDeque`.

### Example

An export fixture gives me three invoice IDs in order. I'd append them to an `ArrayList`. Then I'd check that the second row is invoice `INV-43`.
