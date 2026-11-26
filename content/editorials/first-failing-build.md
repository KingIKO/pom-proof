---
problem: code/first-failing-build
---

Maintain a lower bound on the index where failures can start and an upper bound that includes a possible failure at the midpoint. On a failing midpoint, keep it as the upper bound because it might be the first failure. On a passing midpoint, move the lower bound past it. When the bounds meet, you have either found the first failure or reached the sentinel just past the last index.

The shortcut exits on any failed build it probes. It often returns the right answer when the failure starts near the end. Give it a history where all builds fail and it can report a build in the middle, sending an investigation to the wrong commit.

The interviewer will want to hear why discarding half the remaining range is valid. The no-recovery guarantee is the reason: everything after a failing midpoint also fails. If later builds can recover, this binary search no longer answers the question. Test the all-false and all-true inputs to show the two endpoint behaviors.

[Related reference](https://docs.python.org/3/library/bisect.html)
