---
problem: code/smallest-regression-suite
---

## What is going on

The release needs to cover every required label with the fewest tests. An individual test can cover many labels and still be a poor choice for the complete suite. The small fixture size makes it practical to search subsets and settle equal-size ties exactly.

## The fix

1. Deduplicate the required labels in a set. Sort a copy of the catalog by ASCII ID and start with no best suite.

   **Why:** `duplicates-and-unicode` repeats a required label and expects exact matching, so counting raw entries would overstate the work. The sorted copy gives the search a fixed tie order without rearranging the catalog the caller supplied.

   ```js
   const wanted = new Set(required);
   const ordered = [...tests].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
   let best = null;
   ```

2. Store a completed suite if it improves on the best. Stop exploring an incomplete branch when it has no tests left or is already as large as the best complete suite.

   **Why:** Adding more tests cannot make an incomplete suite shorter. Check completion first so `nothing-required` returns `[]` at the root, and preserve `null` when `empty-catalog` or `uncovered-requirement` never completes. Keeping the earlier equal-size suite is safe because the next step visits those suites in sorted-list order.

   ```js
   const search = (index, chosen, covered) => {
     if (covered.size === wanted.size) {
       if (best === null || chosen.length < best.length) best = chosen;
       return;
     }
     if (index >= ordered.length || (best !== null && chosen.length >= best.length)) return;
   ```

3. At each catalog entry, try including it before skipping it. Copy coverage for the include branch and add only labels that are required.

   **Why:** For suites of equal size, the first differing ID belongs to the branch that took the earlier test. That makes `equal-size-tie` choose `["a","c"]`. A test adding no coverage cannot belong to a minimum suite on that branch, because dropping it keeps the same coverage with fewer tests.

   ```js
     const { id, covers } = ordered[index];
     const next = new Set(covered);
     for (const label of covers) if (wanted.has(label)) next.add(label);
     if (next.size > covered.size) search(index + 1, [...chosen, id], next);
     search(index + 1, chosen, covered);
   };
   ```

4. Start the search at index zero with an empty suite and coverage set, then return `best`.

   **Why:** At the root, no test has been considered and no label can count as covered yet. Keeping `best` separate lets every branch compete with the best complete suite, so `one-test-covers-all` returns the one-test cover even if another test is visited first.

   ```js
   search(0, [], new Set());
   return best;
   ```

## Why the tempting answer fails

Greedy selection can produce a cover without minimizing it. `greedy-trap` picks `a` for four labels, then needs both `b` and `c` for the remaining two. Together `b` and `c` already cover all six. `equal-size-tie` also catches the greedy pick of `["b","c"]` over the earlier `["a","c"]`.

## What the interviewer listens for

Explain why pruning cannot remove a smaller solution and why include-first search settles ties before any final sorting step.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
