---
problem: code/missing-sequence-ids
---

## What is going on

The collector knows the first and last IDs reserved for a run. The receipt list can arrive out of order, repeat captures, or include other runs. The question is which reserved IDs are absent rather than whether the receipt list looks tidy.

## The fix

1. Put the received IDs into a set and start an empty result array.

   **Why:** Membership is all the scan needs. Multiple copies of a receipt in `one-gap` add no evidence, and `out-of-range-ids` can stay in the set because the scan never asks about them. Keeping a separate set also lets the collector preserve receipt order for other investigations.

   ```js
   const received = new Set(ids);
   const missing = [];
   ```

2. Walk the reservation in ascending order, including both endpoints. Append any ID absent from the set.

   **Why:** `single-missing-id` has equal bounds and still requires one membership check. `no-reservation` has reversed bounds and naturally performs none. If the receipt list is empty, `empty-list` must return every reserved value, including the last. Traversing the reservation directly gives sorted results even when the receipts are jumbled. It also finds a gap before the first received ID without needing a separate pass.

   ```js
   for (let id = first; id <= last; id++) {
     if (received.has(id) === false) missing.push(id);
   }
   return missing;
   ```

## Why the tempting answer fails

An exclusive upper bound is common for array indices. This contract includes `last`, so the shortcut loses 22 in `missing-last` and skips the only iteration of `single-missing-id`. It also misses the last element of `empty-list` and skips the maximum safe integer in `safe-integer-limit`.

## What the interviewer listens for

Name both endpoints before choosing a loop and distinguish empty receipts from an empty reservation. The work is building the set once and checking each reserved ID; the bounded reservation length matters more than the absolute size of an ID.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Less than or equal operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal)
- [MDN: Number.isSafeInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
