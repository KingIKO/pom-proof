---
problem: code/second-highest-duration
---

## What is going on

The report needs the next distinct duration below the maximum. Repeated times count as one value. So several runs can tie at the maximum without creating a new candidate. If all runs take the same time, there is no second distinct duration to report.

## The fix

1. Keep two slots that both start as `null`: one for the maximum and one for the best distinct duration below it.

   **Why:** `null` means there is no candidate yet, so the real zero in `second-is-zero` stays a valid answer. Two slots are enough. A value below the current runner-up, the value in second place, can never outrank it later. The scan uses the same small amount of extra memory for any input size, which is called constant space. It also never reorders the caller's measurements.

   ```js
   let first = null;
   let second = null;
   ```

2. Update the two slots for each duration, and move the old maximum to second place whenever a new maximum appears.

   **Why:** A new maximum makes the old maximum the greatest known value below it, even when the input is unsorted. Otherwise, a value takes second place only if it is strictly below the maximum and above the current second, or second is empty. So a repeat of the maximum cannot enter the lower slot, as `tied-maximum` and `large-safe-integers` require. `all-equal`, `one-value`, and `empty-report` never produce a second candidate, so the result stays `null`.

   ```js
   for (const duration of durations) {
     if (first === null || duration > first) {
       second = first;
       first = duration;
     } else if (duration < first && (second === null || duration > second)) {
       second = duration;
     }
   }
   return second;
   ```

## Why the tempting answer fails

The decoy sorts a copy from highest to lowest and takes index one, which keeps the input intact. It handles unsorted values, but index one can still hold the same value as index zero. In `tied-maximum`, `[90,90,24]` returns 90 instead of 24. `all-equal` and `large-safe-integers` catch the same mistake. Removing duplicates before the numeric sort would make that approach correct.

## What the interviewer listens for

Trace a maximum that arrives late to show why both slots move. Then show why repeated values never fill an empty second slot. Test zero as a valid result separately from a report that has no second value at all.

## Sources

- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Strict equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
