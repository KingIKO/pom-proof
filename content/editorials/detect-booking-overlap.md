---
problem: code/detect-booking-overlap
---

## What is going on

The test lab has one room. When a booking ends, the room is free at that exact time for the next booking. So think of each slot as `[start, end)`, which includes the start and excludes the end. The bookings can arrive in any order. Two bookings that sit next to each other in the input tell you little about who uses the room next.

## The fix

1. Sort a shallow copy of the bookings by numeric start time.

   **Why:** In `overlap-out-of-order`, the booking starting at 10 arrives after the one starting at 20. Sorting makes the scan follow the clock. JavaScript's `sort()` changes the array it is called on, so copy the outer array first to keep the delivery order. A shallow copy is a new outer array that holds the same booking pairs. The pairs themselves are only read.

   ```js
   const ordered = [...bookings].sort(([a], [b]) => a - b);
   ```

2. Scan the sorted bookings with a starting end time of zero. A booking that starts before the previous end is a conflict, and any other booking records its own end.

   **Why:** The zero is a sentinel, a starting value that no real booking can conflict with, because starts cannot be negative. Once a booking passes the check, its end is later than its start, and so later than the previous end. That is why the last end is enough, without tracking every booking. `nested-booking` and `identical-slots` report a conflict at once. `one-slot` and `no-bookings` never reach a conflict.

   ```js
   let latestEnd = 0;
   for (const [start, end] of ordered) {
     if (start < latestEnd) return true;
     latestEnd = end;
   }
   return false;
   ```

## Why the tempting answer fails

The tempting shortcut also sorts a copy, but it compares with `<=`. That comparison would fit intervals closed at both ends, where the end time still belongs to the booking. Here, `touching-boundary` and `safe-integer-boundary` release the room exactly when the next booking starts. So the shortcut reports a conflict when there is none.

## What the interviewer listens for

Name the interval convention, meaning whether the end time is included, before you choose the comparison. Then contrast two bookings that share a start with two that only touch, where one ends as the next starts. Finally, explain why the scan can forget earlier ends once a booking passes the check.

## Sources

- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
