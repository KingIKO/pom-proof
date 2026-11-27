---
problem: code/sliding-window-request-decisions
---

## What is going on

A quota decision depends on recent accepted requests from the same client. The left edge of the window is exclusive. Rows with the same timestamp still arrive one at a time, and a rejected row does not take a slot away from a later request.

## The fix

1. Keep per-client queues in a map. Each queue stores accepted timestamps and a head index. Use a separate array for decisions.

   **Why:** `clients-are-independent` lets one client accept while another has used its quota. Each client's timestamps arrive in order, so expired entries form a prefix that a head index can skip. Local queues and decisions leave the input trace unchanged.

   ```js
   const history = new Map();
   const decisions = [];
   ```

2. For each row, advance that client's head past everything at or before `at - windowMs`.

   **Why:** `expiration-at-boundary` should free the slot at the exact boundary. Nondecreasing input times mean anything expired will stay expired. Each accepted timestamp is passed at most once, so this walk uses linear total work without filtering the entire live queue for each request.

   ```js
   for (const { client, at } of requests) {
     const queue = history.get(client) ?? { times: [], head: 0 };
     const expires = at - windowMs;
     while (queue.head < queue.times.length && queue.times[queue.head] <= expires) {
       queue.head++;
     }
   ```

3. Compare the number of live timestamps with the limit. Store the timestamp only on acceptance and append the decision either way.

   **Why:** `same-timestamp` needs earlier accepted rows at that time to count. `unicode-and-zero-limit` requires every request to fail because even zero live entries is not below zero. Only recording an acceptance lets the third request recover in `rejection-does-not-delay-recovery`.

   ```js
     const accept = queue.times.length - queue.head < limit;
     if (accept) queue.times.push(at);
     decisions.push(accept);
     history.set(client, queue);
   }
   return decisions;
   ```

## Why the tempting answer fails

The shortcut filters its history but records every arrival. `rejection-does-not-delay-recovery` accepts at zero, rejects at nine, and should accept at ten. The wrongly stored nine blocks the last request. `safe-integer-boundary` catches the same error near the upper timestamp limit. Filtering the live history every time also repeats work.

## What the interviewer listens for

Explain why moving the head cannot discard future evidence. The array keeps expired entries in memory; a production queue that needs bounded live history could discard them.

## Sources

- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Less than or equal operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal)
