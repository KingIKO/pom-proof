---
problem: code/first-latency-breach
---

## What is going on

A smoke test, a quick check of basic features, records how long each request took, in request order. Each request has a latency budget, the most time it is allowed to take. The report needs the position of the first request that goes over its budget. With that position, an engineer can trace the number back to a specific call. A request that uses the whole budget is still acceptable.

## The fix

1. Define a breach as a duration strictly greater than the budget, and check the cases just below, exactly at, and just above that boundary.

   **Why:** The budget is an allowed maximum, so a duration equal to it is fine. The test case `exactly-at-budget` puts an allowed request before a breach. `zero-budget` makes the same distinction between a duration of zero and a positive duration. `large-safe-integers` checks the rule near the upper end of the permitted values.

2. Call `findIndex()` with the strict comparison.

   **Why:** `findIndex()` visits the samples in index order and stops at the first match, so `first-breach-wins` returns zero even though a later duration is higher. When nothing matches, it returns `-1`, as in `all-below` and `empty-samples`. The predicate is the test function passed to `findIndex()`, and it only reads durations. So the caller's evidence keeps its original order. A loop that returns at its first breach would give the same result.

   ```js
   return durations.findIndex((duration) => duration > budget);
   ```

## Why the tempting answer fails

The tempting shortcut uses `>=`, which makes an allowed request look like a breach. In `exactly-at-budget`, the budget is 50, and a duration of 50 comes before a duration of 51. The shortcut returns index zero instead of one. `zero-budget` and `large-safe-integers` repeat that failure at opposite ends of the allowed range.

## What the interviewer listens for

Put a duration exactly at the allowed threshold and a real breach in the same input. Then explain what sorting the samples or picking the greatest duration would lose. Either choice would discard the link the report asked for, back to the first call that went over budget.

## Sources

- [MDN: Array.findIndex()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
- [MDN: Greater than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than)
