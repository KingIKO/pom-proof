---
problem: code/slowest-test-totals
---

## What is going on

The CI report compares total time per test. Two runs can each be faster than another test's one run while costing more time together. Ranking the totals requires a rule for which name wins an equal-time cutoff.

## The fix

1. Sum run times into a map keyed by the exact name.

   **Why:** In `add-retries`, `cart` reaches 61 milliseconds across two runs and outranks `auth` at 52. Ranking individual rows would miss that. Exact keys keep `A` and `a` apart in `case-sensitive-ties`. The map and its totals stay separate from the caller's run records, so another report can still use the original order.

   ```js
   const totals = new Map();
   for (const { name, ms } of runs) totals.set(name, (totals.get(name) ?? 0) + ms);
   ```

2. Build new report rows and sort by total descending, then by ASCII name ascending.

   **Why:** A comparison that only looks at duration treats equal totals as tied, so a stable sort keeps their previous order. That order depends on which CI shard reports first. The explicit name comparison gives `case-sensitive-ties` the required uppercase-before-lowercase order and sets the winner for `tie-at-cutoff`.

   ```js
   const ranked = Array.from(totals, ([name, totalMs]) => ({ name, totalMs }))
     .sort((a, b) => b.totalMs - a.totalMs || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
   ```

3. Take at most `limit` rows from the sorted report.

   **Why:** The cutoff must see the final tie order, or the right name might already be gone. Slicing also gives `zero-limit` an empty result and leaves the single row intact in `limit-exceeds-count`.

   ```js
   return ranked.slice(0, limit);
   ```

## Why the tempting answer fails

The shortcut sums correctly but sorts by time alone. `tie-at-cutoff` puts `z` first with one run, then gives `a` the same total across two runs. With a limit of one, the decoy picks `z` instead of `a`. `case-sensitive-ties` catches the order error even without cutting off a row.

## What the interviewer listens for

State the direction of both sort keys. Show why the name tie-break belongs before slicing, using a test with two routes to the same total.

## Sources

- [MDN: Array.sort() and sort stability](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
- [MDN: Array.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
