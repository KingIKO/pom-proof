---
problem: code/capped-retry-delays
---

## What is going on

The caller wants a plan for the delays before retries. A delay belongs to one retry; an elapsed timestamp would include the delays of earlier retries too. The cap applies from the first retry onward, including when the base already exceeds it.

## The fix

1. Create an empty result and set the first candidate delay to the smaller of the base and cap.

   **Why:** The cap describes a maximum for every delay. If you first apply it after doubling, `base-over-cap` will start at 80 instead of 20. Starting with a capped value lets the loop use the same rule on every retry: emit the current delay, then prepare the next one.

   ```js
   const delays = [];
   let delay = Math.min(baseMs, capMs);
   ```

2. For each retry, append the current delay and clamp the doubled value for the next retry.

   **Why:** Appending before advancing gives `one-retry` the initial delay. Once the cap is reached, clamping keeps `plateau` flat. It also preserves the exact cap in `safe-integer-cap`: doubling first exceeds it at `2 ** 53`, and `Math.min` picks the supplied safe integer. A zero base stays zero under doubling, and a zero cap keeps every candidate at zero.

   ```js
   for (let i = 0; i < retries; i++) {
     delays.push(delay);
     delay = Math.min(delay * 2, capMs);
   }
   return delays;
   ```

## Why the tempting answer fails

The powers-of-two shortcut gives the right result while backoff stays below the cap. `exact-cap-at-last` still passes because that last doubling happens to land exactly on it. `plateau` exposes the next step: the shortcut emits 80 where the plan needs 45. In `base-over-cap` it is already wrong at the first retry, and `safe-integer-cap` catches it emitting `2 ** 53` instead of stopping at the maximum safe integer.

## What the interviewer listens for

Show how a unit test can compare the planned delays without running timers, including `zero-retries`. If another test needs absolute timestamps, add the delays to elapsed time separately.

## Sources

- [MDN: Math.min()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min)
- [MDN: Number.isSafeInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
