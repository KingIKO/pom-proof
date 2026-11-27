---
problem: code/second-highest-duration
---

## What is going on

The report needs the next distinct duration below the maximum. Several runs can tie at the maximum without creating a new candidate. If all runs take the same time, there is no second distinct duration to report.

## The fix

1. Keep two slots, both initially `null`, for the maximum and the best distinct duration below it.

   **Why:** `null` marks the absence of a candidate and keeps the legitimate zero in `second-is-zero`. Two slots suffice because an observed value below the current runner-up can never outrank it later. The scan requires constant extra space and never reorders the caller's measurements.

   ```js
   let first = null;
   let second = null;
   ```

2. On a new maximum, promote the old maximum to second place. Otherwise, update second place only for a value strictly below the maximum and above the current second, or when second is empty.

   **Why:** A new maximum makes the old one the greatest known value below it, even when the input is unsorted. A repeat of the maximum cannot enter the lower slot, as `tied-maximum` and `large-safe-integers` require. `all-equal`, `one-value`, and `empty-report` never produce a second candidate, leaving the result `null`.

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

Sorting a copy preserves the input and handles unsorted values, but index one can still hold the same value as index zero. In `tied-maximum`, `[90,90,24]` returns 90 instead of 24. `all-equal` and `large-safe-integers` catch the same mistake. Deduplicating before the numeric sort would make that approach correct.

## What the interviewer listens for

Trace a late maximum to show why both slots move, then show why no amount of repeated evidence fills an absent second slot. Check zero as a valid result separately from a report with no second value at all.

## Sources

- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Strict equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
