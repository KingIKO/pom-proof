---
problem: code/first-latency-breach
---

## What is going on

A smoke test records durations in request order. The report needs the position of the first request that exceeds its budget so an engineer can trace that number back to a specific call. A request using the whole budget is still acceptable.

## The fix

1. Define a breach as strictly greater than the budget. Check what should happen just below, right at, and just above that boundary.

   **Why:** The budget is an allowed maximum. The vector `exactly-at-budget` puts an allowed request before a breach, and `zero-budget` makes the same distinction between a duration of zero and a positive duration. `large-safe-integers` checks the rule near the upper end of the permitted values.

2. Use `findIndex()` with the strict comparison.

   **Why:** It visits the samples in index order and stops on the first match, so `first-breach-wins` returns zero even though a later duration is higher. With no match it returns `-1` for both `all-below` and `empty-samples`. The predicate only reads durations, leaving the caller's evidence in its original order. A loop that returns on its first breach would give the same result.

   ```js
   return durations.findIndex((duration) => duration > budget);
   ```

## Why the tempting answer fails

The shortcut uses `>=`, which makes an allowed request look like a breach. In `exactly-at-budget`, a duration of 50 precedes 51 with a budget of 50. It returns index zero instead of one. `zero-budget` and `large-safe-integers` repeat that failure at opposite ends of the allowed range.

## What the interviewer listens for

Put the allowed threshold value and a genuine breach in the same input. Explain why sorting the samples or picking the greatest duration would discard the requested link to the first offending call.

## Sources

- [MDN: Array.findIndex()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
- [MDN: Greater than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than)
