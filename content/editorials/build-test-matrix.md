---
problem: code/build-test-matrix
---

Start with one partial tuple containing no values. For each axis, take the tuples built so far in order and extend each with every distinct value from the new axis. By keeping the existing tuples in the outer loop, you make the newer axis change faster. Build new tuples rather than appending a value into a shared array.

The shortcut returns no tuples if there are no axes. It confuses two different configurations. An empty axis makes a selection impossible, whereas no axes means the runner has one default invocation with no selections to make. Starting with the empty tuple handles both naturally.

An interviewer may ask how many rows this creates. Multiply the counts of distinct values across all axes to estimate the output size, and remember that a complete row contains one entry per axis. A useful test has three axes, with duplicates in the middle one. It verifies both that the order is stable and that repeated parameter values do not schedule needless reruns.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
