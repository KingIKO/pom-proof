---
problem: code/sliding-window-request-decisions
---

## What is going on

A quota is the most requests a client may make within a time window. Each decision depends on that client's recent accepted requests. The window's left edge is exclusive, so a request exactly at that edge no longer counts. Rows with the same timestamp still arrive one at a time. A rejected row does not take a slot away from a later request.

## The fix

1. Keep a map of per-client queues, each holding accepted timestamps and a head index, plus a separate array for decisions.

   **Why:** In `clients-are-independent`, one client can be accepted while another has used up its quota. Each client's timestamps arrive in order. So the expired entries always sit together at the front of the queue. The head index marks the first entry still in the window, which lets the code skip the expired ones. The queues and decisions are local, so the input trace stays unchanged.

   ```js
   const history = new Map();
   const decisions = [];
   ```

2. For each row, move that client's head past every timestamp at or before `at - windowMs`.

   **Why:** `expiration-at-boundary` should free the slot at the exact boundary. Input times never go backward, so an expired entry stays expired. The head passes each accepted timestamp at most once. So the total work is linear, meaning it grows in direct proportion to the number of requests. The code never filters the whole live queue for each request.

   ```js
   for (const { client, at } of requests) {
     const queue = history.get(client) ?? { times: [], head: 0 };
     const expires = at - windowMs;
     while (queue.head < queue.times.length && queue.times[queue.head] <= expires) {
       queue.head++;
     }
   ```

3. Decide by comparing the live count with the limit, and store the timestamp only when the request is accepted.

   **Why:** The decision goes into the result array whether the request is accepted or not. `same-timestamp` needs earlier accepted rows at the same time to count. In `unicode-and-zero-limit`, every request fails, because even zero live entries is not below a limit of zero. Recording only acceptances lets the third request recover in `rejection-does-not-delay-recovery`.

   ```js
     const accept = queue.times.length - queue.head < limit;
     if (accept) queue.times.push(at);
     decisions.push(accept);
     history.set(client, queue);
   }
   return decisions;
   ```

## Why the tempting answer fails

The shortcut filters its history but records every arrival, even a rejected one. `rejection-does-not-delay-recovery` accepts at zero, rejects at nine, and should accept at ten. The wrongly stored nine blocks that last request. `safe-integer-boundary` catches the same error near the largest allowed timestamp. Filtering the live history for every request also repeats work.

## What the interviewer listens for

Explain why moving the head cannot throw away evidence that a later request needs. The array still keeps expired entries in memory. A production queue that must keep its stored history small could discard them.

## Sources

- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Less than or equal operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal)
