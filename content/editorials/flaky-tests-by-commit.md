---
problem: code/flaky-tests-by-commit
---

## What is going on

Flakiness here means conflicting results on the same commit. The report adds each test at the moment a row supplies the missing evidence. The first row with that name may arrive long before the row that proves it flaky.

## The fix

1. Use a map keyed by test, with a second map under each test for its commits. Keep a separate result set.

   **Why:** The two keys keep exact names and commit IDs separate without needing to combine them into a string. `different-commits` depends on keeping observations apart. The result set has a different job: remember when a name first qualified, regardless of when its evidence map was first created.

   ```js
   const evidence = new Map();
   const flaky = new Set();
   ```

2. Walk the rows in arrival order, ignoring skips. Add the outcome to the set for this test and commit; add the test to the result when both executed outcomes are present.

   **Why:** A set records distinct outcomes, so `repeated-passes` cannot look like mixed evidence. `skip-is-neutral` guards against using a skip as a second outcome. Either arrival order can establish the pair, as `passes-then-fails` shows. The row objects stay untouched because only the local collections change.

   ```js
   for (const { test, commit, outcome } of runs) {
     if (outcome === 'skip') continue;
     const commits = evidence.get(test) ?? new Map();
     const seen = commits.get(commit) ?? new Set();
     seen.add(outcome);
     if (seen.size === 2) flaky.add(test);
     commits.set(commit, seen);
     evidence.set(test, commits);
   }
   ```

3. Return the names in result-set order.

   **Why:** `proof-order` puts the first proven name ahead of an earlier observed one. Reinserting an already proven name does not move or duplicate it in `flaky-twice`.

   ```js
   return [...flaky];
   ```

## Why the tempting answer fails

Grouping by name alone merges the pass on `c1` and failure on `c2` in `different-commits`. It can also label a test flaky after an ordinary fix, although each commit alone has a consistent result.

## What the interviewer listens for

Use two interleaved tests to show which row earns each report position. Two flags per pair can replace the outcome set if a skip sets neither flag.

## Sources

- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
