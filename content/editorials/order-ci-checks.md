---
problem: code/order-ci-checks
---

## What is going on

The continuous integration (CI) planner must build a complete schedule of automated jobs, where each job runs after its prerequisites. A prerequisite is a job that must finish before another job starts. At each position, the planner takes the ready ID that comes first alphabetically, in ASCII order. A job becomes ready when its final prerequisite runs, and it can win the very next position. If a cycle of jobs waiting on each other stops the schedule, the planner returns `null`.

## The fix

1. Prepare a sorted list of IDs and two maps: one counts each job's remaining prerequisites, and one lists the jobs waiting on each prerequisite.

   **Why:** The second map lets the planner update only the jobs that depend on each finished job. Each distinct prerequisite counts as one link, called an edge. So `duplicate-dependencies` counts exactly one wait and releases it exactly once. Sorting a separate ID list leaves the supplied jobs and their `needs` arrays intact.

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

2. Schedule the first sorted ID with zero remaining prerequisites at each position, then lower the count of each job waiting on it.

   **Why:** `wait-for-two` keeps `end` blocked until both `a` and `b` are scheduled. Deleting the chosen job's count stops the planner from picking it again. Each scan starts at the beginning of the sorted list, so `earlier-id-just-became-ready` can pick an earlier ID that just became ready. If no job is ready before the schedule is complete, a cycle blocks the remaining jobs. That holds in `partial-cycle` too, where an earlier job already ran.

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

The shortcut sorts the jobs that are ready at the start. Then it uses a first-in, first-out queue, which serves jobs in the order they joined. `earlier-id-just-became-ready` schedules `start` before `z`. Finishing `start` makes `a` ready, but the queue leaves `a` behind `z`. Both orders obey the dependencies, but only `start, a, z` follows the rule for choosing between ready jobs.

## What the interviewer listens for

Each remaining count equals the number of prerequisites that have not run yet. Scanning the sorted IDs can take quadratic time, which grows with the square of the number of jobs. A min-heap is a structure that always hands back its smallest item. It can pick the earliest ready ID without rescanning the whole list.

## Sources

- [Python: Topological sorting and cycles](https://docs.python.org/3/library/graphlib.html)
- [Python: Min-heap operations](https://docs.python.org/3/library/heapq.html)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
