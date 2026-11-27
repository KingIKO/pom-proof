---
problem: code/order-ci-checks
---

## What is going on

The CI planner needs a complete schedule that obeys prerequisites. At each position it must take the alphabetically earliest ready ID, including a job whose final prerequisite just ran. If it cannot finish the schedule, it returns `null`.

## The fix

1. Sort a new list of IDs. Build a map of remaining prerequisites and a reverse map from each prerequisite to the jobs waiting for it.

   **Why:** The planner needs to update only the jobs affected by each completed job. Use one edge per distinct prerequisite so `duplicate-dependencies` counts exactly one wait and releases it exactly once. Sorting a separate ID list leaves the supplied jobs and their `needs` arrays intact.

   ```js
   const ids = jobs.map(({ id }) => id).sort();
   const counts = new Map();
   const dependents = new Map(ids.map((id) => [id, []]));
   for (const { id, needs } of jobs) {
     const unique = new Set(needs);
     counts.set(id, unique.size);
     for (const dep of unique) dependents.get(dep)?.push(id);
   }
   ```

2. At each step, find the first sorted ID with zero remaining prerequisites. Remove its count and decrement each of its dependents.

   **Why:** `wait-for-two` keeps a dependent blocked until both jobs are scheduled. Deleting the selected count prevents it from being picked again, and scanning from the beginning makes a newly ready earlier ID eligible in `earlier-id-just-became-ready`. If no eligible ID exists before the schedule is complete, the remaining jobs are blocked by a cycle. That includes `partial-cycle`, where an earlier job already ran.

   ```js
   const order = [];
   while (order.length < jobs.length) {
     const next = ids.find((id) => counts.get(id) === 0);
     if (next === undefined) return null;
     order.push(next);
     counts.delete(next);
     for (const id of dependents.get(next) ?? []) {
       counts.set(id, (counts.get(id) ?? 0) - 1);
     }
   }
   return order;
   ```

## Why the tempting answer fails

The shortcut sorts the initial ready jobs and then uses a first-in, first-out queue. `earlier-id-just-became-ready` starts `start` before `z`. Finishing `start` makes `a` ready, but the queue leaves `a` behind `z`. Both orders obey the dependencies; only `start, a, z` obeys the tie rule.

## What the interviewer listens for

Each remaining count equals the number of unscheduled prerequisites. Scanning sorted IDs can take quadratic time in the number of jobs; a min-heap can pick the earliest ready ID without rescanning the whole list.

## Sources

- [Python: Topological sorting and cycles](https://docs.python.org/3/library/graphlib.html)
- [Python: Min-heap operations](https://docs.python.org/3/library/heapq.html)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
