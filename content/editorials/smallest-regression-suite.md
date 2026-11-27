---
problem: code/smallest-regression-suite
---

## What is going on

A regression suite is a group of tests that checks whether existing behavior still works. The release needs a suite that covers every required label with the fewest tests. One test can cover many labels and still be a poor choice for the whole suite. The fixtures are small, with at most 12 tests. So the code can search every subset of tests and settle ties between equal-size suites exactly.

## The fix

1. Prepare the search with a set of required labels, a copy of the catalog sorted by ASCII ID, and no best suite yet.

   **Why:** The set keeps one copy of each label. `duplicates-and-unicode` repeats a required label and expects exact matching. Counting raw entries would overstate the work. The sorted copy gives the search a fixed order for breaking ties. It does this without rearranging the catalog that the caller supplied.

   ```js
   const wanted = new Set(required);
   const ordered = [...tests].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
   let best = null;
   ```

2. Save each complete suite that beats the best one, and stop extending a partial suite that cannot win.

   **Why:** A partial suite stops when no tests are left or when it is already as large as the best complete suite. Adding more tests can never make it shorter. The completion check runs first, so `nothing-required` returns `[]` at the root. When `empty-catalog` or `uncovered-requirement` never completes, the result stays `null`. Keeping the earlier equal-size suite is safe, because the next step visits those suites in sorted-list order.

   ```js
   const search = (index, chosen, covered) => {
     if (covered.size === wanted.size) {
       if (best === null || chosen.length < best.length) best = chosen;
       return;
     }
     if (index >= ordered.length || (best !== null && chosen.length >= best.length)) return;
   ```

3. Try two branches at each catalog entry: include the test first, then skip it.

   **Why:** The include branch gets its own copy of the coverage set and adds only required labels. Compare two equal-size suites at their first differing ID. The suite with the earlier ID is the one whose branch took that test, and the search visits that branch first. That makes `equal-size-tie` choose `["a","c"]`. A test that adds no coverage cannot belong to a minimum suite on that branch, because dropping it keeps the same coverage with fewer tests.

   ```js
     const { id, covers } = ordered[index];
     const next = new Set(covered);
     for (const label of covers) if (wanted.has(label)) next.add(label);
     if (next.size > covered.size) search(index + 1, [...chosen, id], next);
     search(index + 1, chosen, covered);
   };
   ```

4. Start the search at index zero with an empty suite and an empty coverage set, then return `best`.

   **Why:** At the root, the search has considered no test, so no label counts as covered yet. Because `best` lives outside the search, every branch competes with the best complete suite found so far. As a result, `one-test-covers-all` returns the one-test suite, even if the search visits another test first.

   ```js
   search(0, [], new Set());
   return best;
   ```

## Why the tempting answer fails

The decoy is greedy: at each step it picks the test that covers the most uncovered labels. That can produce a full cover that is not the smallest. `greedy-trap` picks `a` for four labels, then needs both `b` and `c` for the remaining two. But `b` and `c` together already cover all six. `equal-size-tie` also catches the greedy pick of `["b","c"]` over the earlier `["a","c"]`.

## What the interviewer listens for

Pruning means stopping a branch early because it cannot lead to a better answer. Explain why pruning cannot remove a smaller solution. Also explain why trying the include branch first settles ties before any final sorting step.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
