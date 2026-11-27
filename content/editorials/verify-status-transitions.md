---
problem: code/verify-status-transitions
---

## What is going on

An API test checks a request repeatedly and records the HTTP status code each time. The fixture lists the allowed moves from one recorded status to the next. A move from accepted to complete can be allowed while the reverse move is not. The report lists every unexpected move by the position of the later status, where the unexpected status appears. Only the allowed table sets the rules, because a status code alone cannot say what may follow it.

## The fix

1. Make a set of allowed directed edges by joining the previous and next code with a colon, in that order.

   **Why:** A directed edge is a move that goes one way only. The colon keeps the two codes apart, and the order of the codes keeps the direction. `valid-completion` explicitly allows `202:202`. `same-status-requires-pair` lacks that entry, so the code must reject that repeat. With a set, each observed pair asks the table one yes-or-no question without editing the supplied pairs.

   ```js
   const edges = new Set(allowed.map(([a, b]) => a + ':' + b));
   ```

2. Scan from index one and record the later index of every pair missing from the set, even after a bad transition.

   **Why:** Index zero has no status before it, so `no-transitions` and `empty-trace` return no findings. `check-after-failure` needs the original neighbors at every position, even right after an invalid edge. Visiting the indexes in order puts the results in the required order. It also leaves the trace untouched. `empty-table` marks every pair because no pair was allowed.

   ```js
   const badIndices = [];
   for (let index = 1; index < statuses.length; index++) {
     if (edges.has(statuses[index - 1] + ':' + statuses[index]) === false) {
       badIndices.push(index);
     }
   }
   return badIndices;
   ```

## Why the tempting answer fails

The decoy accepts a pair if either direction is in the table. That check answers a different question: whether two statuses are connected at all. In `reverse-edge-is-invalid`, it wrongly accepts `200 → 202` because `202 → 200` is allowed. That trace contains both directions, so it isolates the ordering rule. In `check-after-failure`, the decoy also excuses the first move, `202 → 429`, because the reverse edge is allowed, so it misses index one.

## What the interviewer listens for

Trace one reverse move and one repeated status. Explain why the code records a bad move without rewriting the recorded statuses or changing the next pair it checks.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
