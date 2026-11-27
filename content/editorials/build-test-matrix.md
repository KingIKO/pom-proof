---
problem: code/build-test-matrix
---

## What is going on

A QA runner needs one row for every combination of parameter values. Each parameter is an axis, which is a list of the values that parameter can take. Each row is a tuple, a short list with one value from each axis.

Two things decide the order in which the rows run. One is the order of the axes. The other is where each exact value first appears in its axis. With no parameters at all, the runner still needs one default run.

## The fix

1. Start the matrix with a single empty tuple.

   **Why:** Before you choose any values, there is exactly one way to have chosen nothing, and that is the empty tuple. The `default-run` test case needs that tuple to come back unchanged. A prefix is a partial row that later axes extend. If the matrix started with zero prefixes, the loop would have nothing to extend, even for a real axis.

   ```js
   let matrix = [[]];
   ```

2. For each axis, extend every existing prefix, in order, with each distinct value that `Set` keeps.

   **Why:** A JavaScript `Set` keeps each exact value once, in the order it was added, so `duplicates-within-axis` drops repeated strings but keeps `A` and `a` apart. In `unicode-and-empty-label`, an empty string still counts as a value. The prefix loop sits outside the value loop, so the newer axis changes faster, as `later-axis-varies-faster` requires. Each new tuple copies its prefix, so no two rows share one array that keeps changing, and the supplied axes stay untouched.

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

   **Why:** An empty axis has no values to add, so no prefix gets extended. That is why `empty-first-axis` and `empty-last-axis` both end with `[]`. With zero axes, the loop never runs, and the single starting row stays as it is.

   ```js
   return matrix;
   ```

## Why the tempting answer fails

The tempting answer uses `flatMap`, and it builds the same rows for ordinary axes. It also has an early return for an empty list of axes. That return sends back `[]` for `default-run`. So the runner asked for one run without parameters and gets zero runs.

## What the interviewer listens for

Estimate the number of rows by multiplying the counts of distinct values on each axis. Every row holds one entry per axis. Then suggest a test with three axes and duplicates in the middle one. That single test checks the row order and catches unneeded reruns at the same time.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
