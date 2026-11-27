---
problem: code/dedupe-case-ids
---

## What is going on

Several test suites put test IDs on a shared rerun queue. The order of the queue says what should run first. So when you remove a repeat, the first nomination must stay where it was. The strings are identifiers, so each one must match exactly. Letter case, whitespace, and the way a character is encoded all matter.

## The fix

1. Pass the original IDs to a `Set` without normalizing them, which means without changing their case, spacing, or encoding.

   **Why:** A `Set` keeps each distinct string once and remembers the order it was added, so `repeats-at-end` leaves the earlier entries in place. `unicode-and-case` keeps three spellings apart: `É`, a composed `é` stored as one character, and a decomposed `e` followed by a separate accent. `space-and-empty` also keeps a space and an empty string as two valid IDs. In Python, a dictionary gives the same mix of distinct keys and insertion order.

   ```js
   const distinct = new Set(ids);
   ```

2. Spread the set into a new array, and return it in that order.

   **Why:** The caller expects a queue it can read as an array. The spread syntax, `...`, copies the set's values in insertion order, so `queue-priority` still starts with `z-first`. The result is a new array, and the supplied queue is neither reordered nor shortened. An empty set gives `[]` for `empty-queue` with no extra code.

   ```js
   return [...distinct];
   ```

## Why the tempting answer fails

The tempting answer adds a sort. That can make a snapshot easier to read, and it passes when the nominations arrive in alphabetical order. `queue-priority` puts `z-first` before `a-second` and repeats `z-first` later. The sorted answer keeps the right IDs but runs `a-second` first.

The same mistake could move a failing smoke test, a quick check of basic features, behind a cleanup test. `unicode-and-case` also shows a changed order, even though no ID is lost. In `space-and-empty`, the empty string moves ahead of the space.

## What the interviewer listens for

Test exact matching and queue order separately. Use a queue whose priority order differs from alphabetical order to check that the earlier ID stays first. Use two identical empty IDs to check that the function keeps one copy of that ID.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [Python: Dictionary insertion order](https://docs.python.org/3/builtins/stdtypes.html#dict)
