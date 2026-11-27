---
title: Tell me how you sped up the 60,000-row test report without losing results.
topic: behavioral
roles: [sdet]
level: mid
type: behavioral
oneLine: Keep the first result for each suite and test ID without scanning the results already written.
looksFor:
  - Explains why an ID alone would discard valid results.
  - Shows what the set stores and what memory that costs.
  - Reports timings on the same input and names the checks that protect the report.
  - Connects interview practice to a choice the candidate made at work.
trap: Reporting a faster runtime after discarding results that belong to a different suite.
followUps:
  - question: Two suites both report that test 17 failed. What should the faster report show?
    answer: Both failures. I'd use the suite name with the test ID as the key and assert that each result survives.
---

I was asked to speed up a report that took 28 seconds on 60,000 results. The change still had
to keep the first result per test. A colleague showed me two suites with the same IDs, so I used
a set of suite-and-ID pairs. I could keep the input order in one pass, though the set grew with
the number of distinct keys.

The same sample took four seconds after the change. I checked an empty run and overlapping IDs
before shipping it. I'd judge a coding exercise by that same tradeoff: can the person explain
why the faster version preserves the output other teams use?

### Example

I'd practice two easy or medium problems per week over a month. I'd rotate through arrays,
maps, sets and queues, then explain the runtime and memory for each solution. I'd apply
patterns like counting and grouping to real tasks such as log parsing.
