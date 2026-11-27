---
problem: code/dedupe-case-ids
---

## What is going on

Several suites put test IDs on a shared rerun queue. The queue says what should run first, so removing a repeat must leave the first nomination where it was. The strings are identifiers: case, whitespace, and the way a character is encoded all matter.

## The fix

1. Pass the original IDs to a `Set` without normalizing them.

   **Why:** The set keeps each distinct string once and remembers insertion order. `repeats-at-end` leaves the earlier entries in place, and `unicode-and-case` keeps `É`, composed `é`, and the decomposed `e` with an accent separate. `space-and-empty` also keeps a space and an empty string as two valid IDs. In Python, a dictionary can supply the same combination of distinct keys and insertion order.

   ```js
   const distinct = new Set(ids);
   ```

2. Spread the set into a new array and return it in that order.

   **Why:** The caller expects a queue it can consume as an array. The spread follows the set's insertion order, so `queue-priority` still starts with `z-first`. It produces a fresh result without reordering or shortening the supplied queue, and an empty set naturally yields `[]` for `empty-queue`.

   ```js
   return [...distinct];
   ```

## Why the tempting answer fails

The extra sort can make a snapshot easier to read, and it passes when the nominations arrive alphabetically. `queue-priority` puts `z-first` before `a-second` and repeats `z-first` later. The decoy keeps the right IDs but runs `a-second` first. The same mistake could move a failing smoke test behind a cleanup test. `unicode-and-case` also exposes a changed order without any lost IDs; `space-and-empty` sees the empty string move ahead of the space.

## What the interviewer listens for

Separate exact matching from order preservation. A queue with priority that conflicts with spelling and a queue with two identical empty IDs test different promises.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [Python: Dictionary insertion order](https://docs.python.org/3/builtins/stdtypes.html#dict)
