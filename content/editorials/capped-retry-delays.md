---
problem: code/capped-retry-delays
---

## What is going on

The caller wants the delay before each retry. Each delay belongs to one retry. An elapsed timestamp would also include the earlier delays. The cap is the most time a retry can wait. It applies from the first retry, even if the starting delay already exceeds it.

## The fix

1. Initialize the retry plan with an empty result and the smaller of the base delay and the cap.

   **Why:** If you apply the cap for the first time after doubling, `base-over-cap` starts at 80 instead of 20. With the first delay already capped, the same loop rule works for every retry. Add the current delay to the plan before you prepare the next one.

   ```js
   const delays = [];
   let delay = Math.min(baseMs, capMs);
   ```

2. Build the plan by adding each current delay before doubling it up to the cap.

   **Why:** Adding the delay before doubling gives `one-retry` the starting delay. In `plateau`, each later delay stays at the cap once it reaches that value. In `safe-integer-cap`, doubling first goes above the cap at `2 ** 53`. The `Math.min` function chooses the smaller value, which is the supplied safe integer. A zero base stays zero when doubled, and a zero cap keeps every delay at zero.

   ```js
   for (let i = 0; i < retries; i++) {
     delays.push(delay);
     delay = Math.min(delay * 2, capMs);
   }
   return delays;
   ```

## Why the tempting answer fails

The powers-of-two shortcut works while backoff, the delay before a retry, stays below the cap. The last doubling in `exact-cap-at-last` hits the cap exactly, so the shortcut passes that case. In `plateau`, the next delay comes out as 80 where the plan needs 45.

In `base-over-cap`, the shortcut gets the first retry wrong. In `safe-integer-cap`, it returns `2 ** 53` for a delay that should stop at the maximum safe integer.

## What the interviewer listens for

Show how a unit test can compare the planned delays without running timers. Include `zero-retries`. If another test needs absolute timestamps, add each delay to the elapsed time in that test.

## Sources

- [MDN: Math.min()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min)
- [MDN: Number.isSafeInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
