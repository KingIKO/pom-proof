---
problem: code/detect-booking-overlap
---

## What is going on

The lab has one room, and the release time is available to the next booking. Think of a slot as `[start, end)`, with the start included and the end excluded. The bookings can arrive in any order, so the original neighbors tell you little about who uses the room next.

## The fix

1. Sort a shallow copy by numeric start time.

   **Why:** In `overlap-out-of-order`, the booking starting at 10 arrives after the one starting at 20. Sorting makes the scan follow the clock. JavaScript's `sort()` changes the array it is called on, so copy the outer array first to preserve the delivery order. The pairs themselves only get read.

   ```js
   const ordered = [...bookings].sort(([a], [b]) => a - b);
   ```

2. Start with an end time of zero. For each booking, report a conflict if it starts before the previous end; otherwise record its end and keep going.

   **Why:** Starts cannot be negative, so the first booking cannot conflict with the sentinel. Once a booking passes the check, its end is later than its start and therefore later than the previous end. That is why the last end suffices without tracking every booking. `nested-booking` and `identical-slots` fail immediately; `one-slot` and `no-bookings` never reach a conflict.

   ```js
   let latestEnd = 0;
   for (const [start, end] of ordered) {
     if (start < latestEnd) return true;
     latestEnd = end;
   }
   return false;
   ```

## Why the tempting answer fails

The shortcut also sorts a copy, but uses `<=`. It would fit intervals closed at both ends. Here `touching-boundary` and `safe-integer-boundary` release the room at exactly the next start, so the shortcut reports a conflict when there is none.

## What the interviewer listens for

Name the interval convention before choosing the comparison. Contrast bookings sharing a start with bookings sharing only a release and start, then explain why the scan can forget earlier ends after a clean step.

## Sources

- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
