---
problem: code/slowest-test-totals
---

Group the rows by name before ranking anything. Two individually fast runs of one test may add up to a larger total than a single slow run of another test. Keep one running total per name and build a separate list to sort. That leaves the raw run order available for any other report.

The shortcut does sum the rows correctly, but it sorts only by time. When two totals tie, it keeps whichever test appeared earlier. A limit that cuts through a tie can then change which tests appear in the report when two CI shards send their rows in a different order.

Spell out both comparison keys in an interview, including which direction each uses. Sorting on the second key ahead of slicing makes the choice at the cutoff deterministic. To test it, arrange for two tests to reach the same total through different numbers of runs, and put the alphabetically later one first in the input. Use a limit that returns only one of the two.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
