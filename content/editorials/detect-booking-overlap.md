---
problem: code/detect-booking-overlap
---

Sort a copy of the bookings by start time. Then compare the next start with the end seen most recently. If the next booking begins before that end, there is an overlap. Since the function returns at the first conflict, the bookings it continues past have disjoint times and strictly increasing ends. That is why storing the last end is enough here.

The shortcut uses less than or equal. That treats a booking that starts exactly when the room is released as a conflict, even though the room is never occupied by both bookings at the same time. If those time ranges were closed at both ends, the shortcut would be correct. Name the interval convention before writing the comparison.

In an interview, use unsorted input to show why a single pass over the original order is insufficient. Check touching bookings alongside bookings that share a start time and still overlap. They differ by only a small change in values, which makes the boundary easy to explain.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
