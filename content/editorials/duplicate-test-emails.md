---
problem: code/duplicate-test-emails
---

## What is going on

A fixture loader checks test email addresses before it fills a test database. A fixture is the prepared test data. The loader reports duplicate addresses in the order each one becomes a duplicate. That moment is the second sighting of the address. So an address that arrived early may still come later in the output, if another address repeated sooner.

## The fix

1. Keep two sets: one for normalized addresses already seen, and one for addresses already known to repeat.

   **Why:** Here a normalized address is the address in lowercase. If an address is already in the first set, this sighting proves a duplicate. If it is already in the second set, a later sighting adds no extra row. Each set takes space in proportion to the number of distinct addresses, however many times each one repeats.

   ```js
   const seen = new Set();
   const duplicates = new Set();
   ```

2. Check each lowercased address against `seen` before you add it there, and copy any repeat into `duplicates`.

   **Why:** `case-match` treats addresses that differ only in letter case as the same address. `independent-aliases` preserves dots and plus tags, because this fixture defines its own comparison rule. So `a.b@example.test` and `a+qa@example.test` stay distinct from `a@example.test`. Checking before adding lets a first sighting, as in `one-address`, pass without a report. The lowercase copy lives in a local variable, so the original fixture stays available for debugging.

   ```js
   for (const email of emails) {
     const normalized = email.toLowerCase();
     if (seen.has(normalized)) duplicates.add(normalized);
     seen.add(normalized);
   }
   ```

3. Return a new array in the order the addresses entered the duplicate set.

   **Why:** The array is the report, and the sets are only working state for the scan. Adding an existing member to a set again does not move it. So a third sighting changes nothing, and `repeated-more-than-twice` gives one row. `interleaved-third-occurrence` keeps the order that the second sightings already set.

   ```js
   return [...duplicates];
   ```

## Why the tempting answer fails

The tempting answer builds a frequency map, which counts how often each address appears. Its counts are correct, but it lists addresses in the order of their first sighting. In `second-occurrence-order`, A arrives before B, and then B repeats before A. The tempting answer still returns A first. `interleaved-third-occurrence` shows the same order problem across three addresses.

## What the interviewer listens for

Explain why the second sighting fixes an address's place in the report, and why a third sighting changes nothing. Do not bring in the matching rules of mail providers. This fixture has its own matching contract, the rule that decides when two addresses count as the same.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: String.toLowerCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase)
