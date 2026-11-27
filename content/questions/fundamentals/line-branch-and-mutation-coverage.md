---
title: The refund calculator wrongly charges a fee at 24 hours, but the test passes. What should the test check?
topic: fundamentals
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd check the fee at the cutoff, even if the existing tests already run the fee calculation.
looksFor:
  - Name the refund amount the test should expect at exactly 24 hours.
  - Explain why testing at 25 hours can leave the no-fee path unchecked.
  - Change the cutoff comparison on purpose to see whether the check fails.
  - Start with a small area and ask whether a change that still passes affects any visible result.
trap: Assuming that because a test ran a line, it checked the result.
followUps:
  - question: If the test for exactly 24 hours still passes after you change the fee rule on purpose, what would you check?
    answer: I'd check that the test sends the exact cutoff time to the calculator. I'd check that it compares the refund the calculator returns. I'd also ask whether the changed comparison can affect any supported result.
sources:
  - label: JaCoCo coverage counters
    url: https://www.jacoco.org/jacoco/trunk/doc/counters.html
  - label: PIT mutation testing concepts and equivalent mutations
    url: https://pitest.org/quickstart/basic_concepts/
---

I'd look for a test that checks for a refund with no fee at exactly 24 hours. I'd change the code to charge at the cutoff and see whether the test fails. That's mutation analysis: I change the code on purpose to see whether the tests catch it. I'd start with just the refund calculation because each change needs a test run. Some changes also leave every visible result the same.

I'd read the coverage report to explain the gap. Line coverage shows which lines of runnable code the tests reached. Branch coverage shows which paths the tests took when the code made a choice, including the path with no fee. Tests can take both paths and earn a high score even if they ignore the results.

### Example

If a request arrives after 24 hours, the code subtracts the fee on its own line. Then it returns the total. If I call the calculator at 25 hours and ignore the total, I can run every line without trying the no-fee path. I also haven't checked any amount. I'd check both totals, including the one at exactly 24 hours, so charging a fee at the cutoff fails the test.
