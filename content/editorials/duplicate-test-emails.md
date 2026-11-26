---
problem: code/duplicate-test-emails
---

Normalize once per address. Keep a set of normalized addresses you have seen, plus an ordered collection of duplicates. The first encounter only updates the seen set. The second adds a result, and later encounters must leave its position alone.

A frequency map gives correct counts, but iterating that map after the scan reports duplicates in first-occurrence order. Put address A first, address B second, then repeat B before A. The requested result starts with B. This one example separates two answers that can look identical when both addresses repeat in the same order.

In an interview, call out that this fixture defines its own comparison rule. You do not need to apply rules specific to a mail provider. In particular, dots and tags can distinguish test accounts in this fixture. State the expected behavior for three occurrences and explain why you return a list rather than exposing the internal sets. The two collections take space proportional to the number of distinct addresses.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
