---
problem: code/latest-attempts-per-shard
---

Maintain one selected event for each shard in an insertion-ordered map. An event replaces the current one if its attempt number is greater or equal. Updating an existing entry keeps that shard's place in the map, so you can return the selected events without sorting.

The shortcut updates only for a strictly greater attempt. A sequence with one event per attempt works, and out-of-order attempts still look correct. Give it a running event and a completed event for the same attempt, though, and the report can stay stuck on running. Replacing on equality uses the observed delivery order to resolve that tie.

In an interview, separate the order used to choose a row from the order used to display the rows. The first depends on attempt number and delivery position. The second depends only on the earliest appearance of each shard. Try an older attempt arriving after a completion as well as a completion arriving for an equal attempt. The two cases rule out replacing every time and never replacing on ties.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
