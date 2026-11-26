---
problem: code/count-result-lines
---

Start with counters for all the known outcomes. For each entry, remove the padding the importer actually permits and then compare the remaining tag exactly. That gives downstream code a stable object shape even for an empty file or one made up entirely of unknown entries.

The shortcut calls a general whitespace trimmer and uppercases the result. It feels helpful and it accepts the documented examples, but it silently repairs malformed input. In a report, a tab-padded failure would then count alongside exact failures. If a writer starts emitting malformed tags, the resulting numbers can hide the change in the writer.

Interviewers may ask you to draw a line between normalization and validation. Show which changes the contract permits and which would change the meaning of a record. An example containing a space on one side and a tab on the other makes that distinction visible. Also show the empty output so the caller knows it can read all three counters without testing for missing keys.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)
