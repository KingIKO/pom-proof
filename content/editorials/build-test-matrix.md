---
problem: code/build-test-matrix
---

## What is going on

The runner needs one row for every combination of parameter values. The order of the axes and the first appearance of each exact value determine when each row runs. No parameters still means one default invocation.

## The fix

1. Seed the matrix with a single empty tuple.

   **Why:** Before choosing any values, there is exactly one way to have chosen nothing. `default-run` needs that tuple to survive unchanged. Starting with zero prefixes would also leave the loop with nothing to extend for a real axis.

   ```js
   let matrix = [[]];
   ```

2. For each axis, make a list of its distinct values with `Set`. For each existing prefix in order, build one fresh tuple per value.

   **Why:** A set iterates in insertion order, so `duplicates-within-axis` drops repeated strings without merging `A` and `a`. An empty string still counts in `unicode-and-empty-label`. The prefix loop outside the value loop makes the newer axis change faster, as `later-axis-varies-faster` requires. Copying each prefix prevents two rows from sharing an array that keeps changing, and the supplied axes stay untouched.

   ```js
   for (const axis of axes) {
     const values = [...new Set(axis)];
     const next = [];
     for (const prefix of matrix) {
       for (const value of values) next.push([...prefix, value]);
     }
     matrix = next;
   }
   ```

3. Return the matrix after the last axis.

   **Why:** An empty axis produces no extensions, so `empty-first-axis` and `empty-last-axis` both end with `[]`. Zero axes leave the single seed row intact.

   ```js
   return matrix;
   ```

## Why the tempting answer fails

The `flatMap` version can build the same rows for ordinary axes. Its early return sends back `[]` for `default-run`, so it schedules zero runs when the runner requested a single run without parameters.

## What the interviewer listens for

Multiply the distinct value counts to estimate the number of rows, with one entry per axis in every row. A three-axis test with duplicates in the middle checks ordering and unnecessary reruns together.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
