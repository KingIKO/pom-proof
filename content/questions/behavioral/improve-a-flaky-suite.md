---
title: Tell me about a time you improved an unreliable test suite.
topic: behavioral
roles: [automation, sdet, senior]
level: mid
type: behavioral
oneLine: Show how you found the dominant cause, repaired it, and measured the change without counting retries as passes.
looksFor:
  - What you personally investigated and changed
  - A before-and-after measure with a denominator
  - Evidence from the conditions that produced failures
  - A lesson other tests can use
trap: Giving a vague claim that the suite became stable after increasing timeouts.
followUps:
  - question: How did you know the tests still caught failures?
    answer: I repeated the original scenario with an intentionally wrong result and checked that the assertion reported it.
---

Our returns suite interrupted merges even when the code under review hadn't touched returns. I was asked to find the largest source of noise. I tagged first-attempt failures for two weeks and found the same test account in several overlapping runs. Its history was changing while another test read it.

I added a data fixture that issued each test its own return and kept the returned ID for cleanup. I tested it first with the two checks that interfered, then ran the same suite schedule for another two weeks. First-attempt failures fell from 22 of 180 executions to 3 of 180. I learned to track failures by cause before editing waits.

### Example

One test withdrew a return while another opened it for review. With separate returns, both cases kept their original assertions and ran in parallel.
