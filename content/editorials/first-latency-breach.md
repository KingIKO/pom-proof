---
problem: code/first-latency-breach
---

Read the durations in arrival order and stop when you find one strictly above the budget. JavaScript's `findIndex` expresses both parts of the return contract: it returns an index when it finds a match and minus one when it does not. An ordinary loop that returns early works just as well.

The shortcut uses greater than or equal. Most examples below or above the budget give the same result in both implementations. The exact threshold is where they differ. If a request at the threshold precedes a genuine breach, the shortcut points the engineer to the wrong request.

When explaining this in an interview, show values just below, at, and above the threshold. Then put the at-threshold and above-threshold values in the same input to demonstrate that you return the correct first index. Sorting or finding the biggest value would answer a different question. The request order is part of the evidence that helps someone trace the breach back to a specific call.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
