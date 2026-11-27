---
problem: code/duplicate-test-emails
---

## What is going on

The fixture loader reports duplicate addresses in the order each one becomes a duplicate. The useful event is the second sighting. An address that arrived early may still belong later in the output if another address repeated sooner.

## The fix

1. Keep one set for normalized addresses already seen and another for addresses already known to repeat.

   **Why:** Membership in the first set answers whether this sighting proves a duplicate. Membership in the second keeps a later sighting from adding another row. Both sets take space proportional to the number of distinct addresses, regardless of how many times each one repeats.

   ```js
   const seen = new Set();
   const duplicates = new Set();
   ```

2. Lowercase the address into a local variable. If it is already in `seen`, add it to `duplicates`, then record it in `seen`.

   **Why:** `case-match` treats case variants as the same address. `independent-aliases` preserves dots and plus tags because this fixture defines its own comparison rule. Checking before insertion lets a first sighting such as `one-address` pass without a report. A local value keeps the original fixture available for debugging.

   ```js
   for (const email of emails) {
     const normalized = email.toLowerCase();
     if (seen.has(normalized)) duplicates.add(normalized);
     seen.add(normalized);
   }
   ```

3. Return a new array in the duplicate set's insertion order.

   **Why:** The array is the report, while the sets are scan state. A third occurrence does not move an existing member, so `repeated-more-than-twice` emits one row and `interleaved-third-occurrence` keeps the order already established by second sightings.

   ```js
   return [...duplicates];
   ```

## Why the tempting answer fails

The frequency map counts correctly but iterates addresses in first-sighting order. In `second-occurrence-order`, A arrives before B, then B repeats before A. The decoy returns A first. `interleaved-third-occurrence` exposes the same ordering problem across three addresses.

## What the interviewer listens for

Explain why the second sighting fixes an address's place and why a third sighting changes nothing. Avoid importing mail-provider rules into a fixture with its own matching contract.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: String.toLowerCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase)
