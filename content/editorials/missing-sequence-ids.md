---
problem: code/missing-sequence-ids
---

Build a membership set from the received IDs, then walk the reserved interval in increasing order. Values outside the interval cannot affect the result, so there is no need to remove them first. Each missing ID is already appended at its proper position, even when the received list is jumbled.

The shortcut uses a strict comparison against the last reserved ID. That loop is common for array indices, but on this input the upper endpoint is part of the interval. A report containing all IDs except the final one exposes the bug. So does a one-ID reservation with no receipt, since the shortcut does not visit that interval at all.

The strongest explanation names both boundaries before choosing a loop. It also points out where the work scales: build the set once, then do a membership check per reserved ID. The input bounds the length of the reservation, so the absolute size of an ID does not drive the cost. Try empty receipts separately from an empty reservation.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
