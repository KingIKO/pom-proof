---
problem: code/classify-test-retries
---

## What is going on

A report needs one verdict for one test's attempts, in execution order. A skipped attempt contributes no execution result. If a test passed once but failed on its last real attempt, the report must still show the failure.

## The fix

1. Filter the skips into a new list and take the last entry with `at(-1)`.

   **Why:** The original array may end with a skip, as it does in `recovered` and `failed-last`. A new array keeps the attempts in order and leaves the complete history available for another report or a debugging view.

   ```js
   const executed = attempts.filter((outcome) => outcome !== 'skipped');
   const last = executed.at(-1);
   ```

2. Return `not-run` when no entry remains, or `failed` when the last entry is a failure.

   **Why:** `at(-1)` returns `undefined` for an empty array, so `empty` and `skipped-only` share one branch. The final failure takes precedence over any earlier pass, which keeps `failed-last` and `all-failed` visible as active failures.

   ```js
   if (last === undefined) return 'not-run';
   if (last === 'failed') return 'failed';
   ```

3. With a final pass established, check for any earlier failure.

   **Why:** At this point a failure anywhere in `executed` necessarily came before the last pass. That is the recovery evidence in `recovered`. In `first-pass`, the skipped attempt leaves no such evidence.

   ```js
   return executed.includes('failed') ? 'flaky' : 'passed';
   ```

## Why the tempting answer fails

The shortcut checks which outcomes occurred, so it gives the same answer for `["failed", "passed"]` and `["passed", "failed"]`. `failed-last` adds a trailing skip to the second order. It expects `failed`, but the shortcut sees both outcomes and reports `flaky`, hiding the unresolved failure.

## What the interviewer listens for

State the two pieces of evidence: the last executed outcome and whether a failure occurred. A single scan can carry those two values in constant extra space; the filtered-list solution trades that space for a direct read of the final attempt.

## Sources

- [MDN: Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Array.at()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
- [MDN: Array.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
