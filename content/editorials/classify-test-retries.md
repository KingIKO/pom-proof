---
problem: code/classify-test-retries
---

## What is going on

A QA report needs one verdict for each test. A verdict is a single label, such as `flaky` or `failed`. It comes from that test's attempts, listed in the order they ran. A skipped attempt never ran, so it adds no result. If a test passed once but failed on its last real attempt, the report must still show the failure.

## The fix

1. Build a new list without the skips, and read its last entry with `at(-1)`.

   **Why:** The original array may end with a skip, as it does in the `recovered` and `failed-last` test cases. So the array's own last entry may not be a real result. The `filter` method builds a new array and keeps the attempts in order. The complete history stays available for another report or a debugging view.

   ```js
   const executed = attempts.filter((outcome) => outcome !== 'skipped');
   const last = executed.at(-1);
   ```

2. For an empty list, return `not-run`, and for a failed last entry, return `failed`.

   **Why:** For an empty array, `at(-1)` returns `undefined`, so `empty` and `skipped-only` share one branch. A failure on the last attempt outranks any earlier pass. That rule keeps `failed-last` and `all-failed` visible as failures that are still unresolved.

   ```js
   if (last === undefined) return 'not-run';
   if (last === 'failed') return 'failed';
   ```

3. Once you know the last attempt passed, check for any earlier failure.

   **Why:** At this point the last attempt passed, so any failure in `executed` must have come before it. A failure followed by a pass is the evidence for `flaky`. The `recovered` test case has that evidence. In `first-pass`, the only other attempt was skipped, so there is no such evidence.

   ```js
   return executed.includes('failed') ? 'flaky' : 'passed';
   ```

## Why the tempting answer fails

The tempting shortcut checks only which outcomes occurred, not their order. So it gives the same answer for `["failed", "passed"]` and `["passed", "failed"]`. The `failed-last` test case is the second order with a skip added at the end. It expects `failed`. The shortcut sees both outcomes and reports `flaky`, which hides the unresolved failure.

## What the interviewer listens for

Name the two pieces of evidence. One is the outcome of the last attempt that ran. The other is whether any failure occurred. A single pass over the attempts can track both values in constant extra space, meaning memory that does not grow with the input. The filtered list uses more space, and in return it reads the last attempt directly.

## Sources

- [MDN: Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Array.at()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
- [MDN: Array.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
