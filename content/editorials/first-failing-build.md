---
problem: code/first-failing-build
---

## What is going on

This history has a single possible change from passing builds to failing builds. The investigation needs the first failing build, since that gives the history position where the problem began. A failed build in the middle only tells you the change happened at or before that point.

## The fix

1. Keep the lowest and highest possible positions for the first failure, with one past the last build as a sentinel.

   **Why:** A history can have no failures at all. The sentinel lets `empty-history` start with the bounds already together, and it gives `no-failure` a position to converge on without inventing an array entry.

   ```js
   let low = 0;
   let high = failed.length;
   ```

2. Probe the midpoint. Keep it as the upper bound if it failed; move the lower bound past it if it passed.

   **Why:** A failing midpoint is still a candidate. Keeping it makes `all-builds-fail` converge on zero and `several-builds-fail` converge on one. A passing midpoint rules itself and all earlier builds out because the history never recovers. Each probe shrinks the remaining range, making the work logarithmic without changing any history entries.

   ```js
   while (low < high) {
     const mid = low + Math.floor((high - low) / 2);
     if (failed[mid]) high = mid;
     else low = mid + 1;
   }
   ```

3. Translate the sentinel to `-1` and return any real index unchanged.

   **Why:** `failure-only-at-end` still needs the last real index. Keeping it separate from the sentinel also gives `one-passing-build` its no-failure result.

   ```js
   return low === failed.length ? -1 : low;
   ```

## Why the tempting answer fails

Returning on the first failing probe works when that probe lands on the transition. In `all-builds-fail` it reports the middle build rather than index zero. In `several-builds-fail` it also points later than the commit the investigator needs.

## What the interviewer listens for

Show how a passing probe and a failing probe eliminate different ranges. Contrast all-passing and all-failing histories, and say what breaks if builds can recover.

## Sources

- [Python: Array bisection and the leftmost insertion point](https://docs.python.org/3/library/bisect.html)
- [MDN: Math.floor()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor)
