---
problem: code/slowest-test-totals
---

## What is going on

The continuous integration (CI) report shows results from automated test runs. It compares the total time spent on each test. Each of a test's two runs can be faster than another test's single run, while the two together cost more time. When equal totals meet at the cutoff, the report needs a rule for which name wins.

## The fix

1. Sum the run times into a map keyed by the exact test name.

   **Why:** In `add-retries`, `cart` reaches 61 milliseconds across two runs and outranks `auth` at 52. Ranking individual rows would miss that. Exact keys keep `A` and `a` apart in `case-sensitive-ties`. The map holds its totals apart from the caller's run records. So another report can still use the original order.

   ```js
   const totals = new Map();
   for (const { name, ms } of runs) totals.set(name, (totals.get(name) ?? 0) + ms);
   ```

2. Build new report rows and sort them by total from largest to smallest, then by name in ascending ASCII order.

   **Why:** A comparison that looks only at duration treats equal totals as tied. A stable sort keeps tied rows in their previous order. That order depends on which CI shard, one slice of the test run, reports first. The explicit name comparison gives `case-sensitive-ties` the required order, with uppercase before lowercase. It also decides the winner for `tie-at-cutoff`.

   ```js
   const ranked = Array.from(totals, ([name, totalMs]) => ({ name, totalMs }))
     .sort((a, b) => b.totalMs - a.totalMs || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
   ```

3. Take at most `limit` rows from the sorted report.

   **Why:** If the cutoff runs before the tie order is final, the right name might already be gone. Slicing gives `zero-limit` an empty result. It also leaves the single row intact in `limit-exceeds-count`.

   ```js
   return ranked.slice(0, limit);
   ```

## Why the tempting answer fails

The shortcut adds up the times correctly but sorts by time alone. `tie-at-cutoff` lists `z` first with one run. Then `a` reaches the same total across two runs. With a limit of one, the decoy picks `z` instead of `a`. `case-sensitive-ties` catches the order error even when no row is cut off.

## What the interviewer listens for

State the direction of both sort keys. Then show why the name tie-break must come before slicing. Use a case where two tests reach the same total in different ways.

## Sources

- [MDN: Array.sort() and sort stability](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
- [MDN: Array.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
