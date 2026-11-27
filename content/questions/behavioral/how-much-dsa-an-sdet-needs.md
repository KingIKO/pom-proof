---
title: "How did you speed up a 60,000-row test report without dropping results?"
topic: behavioral
roles: [sdet]
level: mid
type: behavioral
oneLine: "I kept each suite's first result for every test ID without rereading the results I'd already saved."
looksFor:
  - "Explain why using the test ID alone would drop valid results."
  - "Describe what the set remembers and how much memory it needs."
  - "Compare times on the same input and name the checks that protect the report."
  - "Connect interview practice to a decision you made at work."
trap: "Calling the report faster after dropping results from a different test suite."
followUps:
  - question: "If test 17 fails in two suites, what should the faster report show?"
    answer: "I'd keep both failures. I'd identify each result by its suite name and test ID, then check that both results appear."
---

I was asked to speed up a report that took 28 seconds for 60,000 results. I still had to keep the first result per test. A colleague showed me two suites, or groups of tests, that reused the same test IDs. I used a set, a collection that keeps each entry once, to track suite-and-ID pairs. I read the input once and kept its order.

The more distinct pairs I saw, the more memory the set needed. The same sample took four seconds after the change. I checked an empty run and IDs shared by different suites before shipping. I'd look for the same tradeoff in a coding exercise. I'd ask the candidate to explain why the faster version still gives other teams the results they need.

### Example

I'd practice two easy or medium problems per week for a month. I'd choose problems that use arrays, maps, sets, and queues. I'd explain how long each solution takes to run and how much memory it uses. I'd use counting and grouping on real work, such as pulling information from a log.
