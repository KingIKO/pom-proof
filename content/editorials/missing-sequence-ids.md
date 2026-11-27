---
problem: code/missing-sequence-ids
---

## What is going on

The collector reserves a block of capture IDs for each run, and it knows the first and last ID of that reservation. The receipt list can arrive out of order, repeat captures, or include IDs from other runs. The question is which reserved IDs never arrived. Whether the receipt list looks tidy does not matter.

## The fix

1. Put the received IDs into a set and start an empty result array.

   **Why:** A set answers one question quickly: is this value present? That membership check is all the scan needs. In `one-gap`, extra copies of a receipt add no evidence. The extra IDs in `out-of-range-ids` can stay in the set, because the scan never asks about them. A separate set also leaves the receipt list in its original order for other investigations.

   ```js
   const received = new Set(ids);
   const missing = [];
   ```

2. Walk the reservation in ascending order, including both endpoints, and append each ID that is absent from the set.

   **Why:** In `single-missing-id`, the two bounds are equal, so the loop still makes one check. In `no-reservation`, `first` is greater than `last`, so the loop makes no checks at all. When the receipt list is empty, `empty-list` must return every reserved value, including the last. Walking the reservation itself gives sorted results, even when the receipts are jumbled. It also finds a gap before the first received ID without a separate pass.

   ```js
   for (let id = first; id <= last; id++) {
     if (received.has(id) === false) missing.push(id);
   }
   return missing;
   ```

## Why the tempting answer fails

The shortcut stops before `last`. That kind of limit is called an exclusive upper bound, and it is common for array indices. This problem includes `last`, so the shortcut loses 22 in `missing-last`. It also skips the only check in `single-missing-id`. It misses the last value of `empty-list` and the maximum safe integer in `safe-integer-limit`.

## What the interviewer listens for

Name both endpoints before you choose a loop. Tell an empty receipt list apart from an empty reservation. The work is building the set once and then checking each reserved ID. So the reservation length, which is at most 200 IDs, matters more than how large an ID is.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Less than or equal operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal)
- [MDN: Number.isSafeInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
