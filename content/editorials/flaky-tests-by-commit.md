---
problem: code/flaky-tests-by-commit
---

## What is going on

A flaky test gives different results when the code has not changed. In this report, a test is flaky when it both passed and failed on the same commit. A commit is one saved version of the code. The report adds a test name at the moment a row supplies the missing evidence. The first row for a test may arrive long before the row that proves it flaky.

## The fix

1. Create an evidence map keyed first by test and then by commit, plus a separate result set.

   **Why:** A map stores values under keys, and a set keeps each value only once. Two levels of keys keep exact test names and commit IDs apart without joining them into one string. `different-commits` depends on keeping observations from different commits apart. The result set has a separate job. It remembers when a name first qualified, no matter when its evidence map was created.

   ```js
   const evidence = new Map();
   const flaky = new Set();
   ```

2. Walk the rows in arrival order and record each pass or fail under its test and commit.

   **Why:** A set records only distinct outcomes, so `repeated-passes` cannot look like mixed evidence. `skip-is-neutral` checks that a skip never counts as a second outcome. When one commit holds both a pass and a fail, the code adds the test to the result. Either arrival order proves the pair, as `passes-then-fails` shows. Only the local collections change, so the row objects stay untouched.

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

3. Return the names in the order they entered the result set.

   **Why:** In `proof-order`, the first row belongs to `a`, but `状態` is proven flaky first. So the report lists `状態` ahead of the earlier observed `a`. A set keeps the order in which names were first added. Adding an already proven name again neither moves it nor adds a copy, as `flaky-twice` shows.

   ```js
   return [...flaky];
   ```

## Why the tempting answer fails

The decoy, the tempting wrong answer, groups outcomes by test name alone. In `different-commits`, it merges the pass on `c1` with the failure on `c2`. It can also flag a test after an ordinary fix. Suppose a test fails on one commit and a fix makes it pass on the next. Each commit on its own has a consistent result, but the decoy still calls the test flaky.

## What the interviewer listens for

Use two tests whose rows are mixed together. Show which row earns each position in the report. You can replace the outcome set with two flags for each test and commit pair. That works only if a skip sets neither flag.

## Sources

- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
