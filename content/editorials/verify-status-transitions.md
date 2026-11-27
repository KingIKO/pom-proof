---
problem: code/verify-status-transitions
---

## What is going on

The fixture lists allowed moves between consecutive observations. Going from accepted to complete can be legal without allowing the reverse. The report needs every unexpected move and points to the later observation, where the unexpected status appears. The allowed table supplies the rules; the numeric status alone cannot tell you what may follow it.

## The fix

1. Make a set of allowed directed edges. Join the previous and next code with a colon in that order.

   **Why:** The delimiter separates the two integer codes and the key preserves direction. `valid-completion` explicitly allows `202:202`, while `same-status-requires-pair` lacks that entry and must reject it. A membership set lets each observed pair ask one question about the table without editing the supplied pairs.

   ```js
   const edges = new Set(allowed.map(([a, b]) => a + ':' + b));
   ```

2. Scan from index one and record the later index of each missing pair. Keep going after a bad transition.

   **Why:** Index zero has no predecessor, so `no-transitions` and `empty-trace` return no findings. `check-after-failure` needs the original neighbors at every position, even immediately after an invalid edge. Visiting indices in order gives the result its required ordering while leaving the trace untouched. `empty-table` marks every pair because none was allowed.

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

Checking both directions can answer whether two nodes are connected. Here it incorrectly accepts `200 → 202` in `reverse-edge-is-invalid` because `202 → 200` is allowed. Including both directions in one trace isolates the ordering rule. In `check-after-failure`, it also excuses the first `202 → 429` by finding the allowed reverse edge and misses index one.

## What the interviewer listens for

Trace one reverse move and one repeated status. Explain why a bad move is recorded without rewriting history or changing the next pair to check.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
