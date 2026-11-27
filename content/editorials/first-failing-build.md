---
problem: code/first-failing-build
---

## What is going on

This build history can change from passing builds to failing builds only once, and it never changes back. The investigation needs the first failing build. Its position in the history shows where the problem began. A failed build in the middle tells you only that the change happened at or before that point.

## The fix

1. Track the lowest and highest possible positions of the first failure, using one past the last build as a sentinel.

   **Why:** A sentinel is a stand-in value that means "no real build here." A history can have no failures at all. With the sentinel as the upper bound, `empty-history` starts with both bounds already equal. The sentinel also gives `no-failure` a position to settle on without inventing an array entry.

   ```js
   let low = 0;
   let high = failed.length;
   ```

2. Probe the midpoint, the build halfway between the bounds. If it failed, it becomes the upper bound, and if it passed, the lower bound moves just past it.

   **Why:** A failing midpoint might still be the first failure, so keeping it lets `all-builds-fail` settle on zero and `several-builds-fail` settle on one. A passing midpoint rules out itself and every earlier build, because the history never recovers. Each probe cuts the remaining range about in half. So the work grows logarithmically, which means about one more probe each time the history doubles in length. No history entry changes along the way.

   ```js
   while (low < high) {
     const mid = low + Math.floor((high - low) / 2);
     if (failed[mid]) high = mid;
     else low = mid + 1;
   }
   ```

3. Turn the sentinel into `-1`, and return any real index as it is.

   **Why:** `failure-only-at-end` still needs the last real index, so that index must stay separate from the sentinel. Keeping them separate also gives `one-passing-build` its no-failure result.

   ```js
   return low === failed.length ? -1 : low;
   ```

## Why the tempting answer fails

The tempting answer returns as soon as a probe finds a failure. That works when the probe lands exactly on the change from passing to failing. In `all-builds-fail`, it reports the middle build instead of index zero. In `several-builds-fail`, it also points later than the commit the investigator needs.

## What the interviewer listens for

Show how a passing probe and a failing probe rule out different ranges. Contrast a history where every build passes with one where every build fails. Then say what breaks if builds can recover after a failure.

## Sources

- [Python: Array bisection and the leftmost insertion point](https://docs.python.org/3/library/bisect.html)
- [MDN: Math.floor()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor)
