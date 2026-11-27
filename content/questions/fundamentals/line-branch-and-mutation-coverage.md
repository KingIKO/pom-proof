---
title: A refund test passes even when the calculator wrongly charges at 24 hours. What assertion is missing?
topic: fundamentals
roles: [sdet, senior]
level: senior
type: concept
oneLine: Show whether the suite checks the fee at the cutoff, even if it already executes the fee calculation.
looksFor:
  - Names the amount the test should assert at exactly 24 hours.
  - Explains why a call at 25 hours can leave the no-fee path unchecked.
  - Uses a deliberately changed comparison to challenge the assertion.
  - Limits mutation work and checks whether a surviving change is observable.
trap: Treating a fully covered line as evidence that a test checked its result.
followUps:
  - question: The fee mutation still passes after you add a 24-hour test. What would you inspect?
    answer: I'd check that the test gets the actual cutoff time into the calculator and compares the returned refund amount. I'd also check whether the changed comparison can alter any supported result.
sources:
  - label: JaCoCo coverage counters
    url: https://www.jacoco.org/jacoco/trunk/doc/counters.html
  - label: PIT mutation testing concepts and equivalent mutations
    url: https://pitest.org/quickstart/basic_concepts/
---

I'd ask whether the suite compares the returned refund at exactly 24 hours against the amount
with no fee. I'd deliberately move the fee onto that cutoff and see whether the test fails.
That's the question mutation analysis asks. I'd start with the refund calculation because each
change takes a test run, and some changes leave the observable behavior identical.

Then I'd read the coverage report to explain the gap. Line coverage records which executable
lines ran. Branch coverage shows which outcomes ran, including the no-fee path. A high score
can still come from tests that exercised the branches and ignored what they returned.

### Example

The refund code subtracts a fee on its own line when a request arrives after 24 hours, then returns
the total. A test that calls the function at 25 hours and ignores the return can execute every line
without taking the no-fee branch or checking a single amount. I would assert both totals, including
at exactly 24 hours, so a mutation that includes the cutoff in the fee period fails.
