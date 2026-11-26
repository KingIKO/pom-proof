---
problem: code/capped-retry-delays
---

Store a single delay and append it once per retry. The initial value already respects the cap. After appending, compute the next value from the current one and apply the cap again. Once the value reaches the cap, future retries keep the same delay. No timers are needed to answer a question about the schedule.

The shortcut uses powers of two directly. It gives the expected sequence until the delay gets large enough to hit the cap, then keeps growing. Testing the step at the cap and the step after it exposes that difference. An initial base that already exceeds the cap is a separate case because the very first retry can be wrong.

Interviewers may ask how a test could check exponential backoff without actually waiting. Returning pure delay values gives a unit test something precise to compare. Clarify that this list describes the delay before each retry. A clock driven test that wants absolute timestamps would have to add the delays to elapsed time.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min)
