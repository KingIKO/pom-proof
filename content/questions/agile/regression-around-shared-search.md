---
title: "A search change touches a shared database query. What else would you test this sprint?"
topic: agile
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd find which features use the query. I'd start where a wrong result would do the most harm."
looksFor:
  - "Ask which screens and background jobs use the query."
  - "Pick test data that gives different results under the old and new rules."
  - "Check a feature that should change and one that should stay the same."
  - "Say which checks an existing test covers and which can wait."
trap: "Running every search test but missing a report that uses the same query."
followUps:
  - question: "What if you don't know which features share the query?"
    answer: "I'd ask the developer to trace where the query runs with me. Until then, I'd list what I've checked and mark the rest as unverified."
---

I'd ask the developer to show me what uses the query, the instruction that fetches results from the database. A small change can affect pages the ticket doesn't name. I'd pick test records that make the old and new results easy to tell apart. I'd check at least one feature that should still give the old result.

I'd spend my time on features where the wrong result could hurt a customer or lead to a bad business decision. If another screen only shows those results in a different layout, I'd rely on existing tests unless that layout changed too.

### Example

Support asked us to include archived orders in order search. The warehouse report used the same query, but it still needed to exclude archived orders. I made one active order and one archived order for the same buyer. Search returned both as expected, but so did the report.

The developer made each feature say whether to include archived orders. I reran both checks with the same orders.
