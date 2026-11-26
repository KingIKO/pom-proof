---
problem: code/verify-status-transitions
---

Model the allowed table as directed edges. A pair made from the previous status and the next status is a single lookup key. Starting at index one, build that key for every adjacent pair and report the current index if it is absent. A bad edge does not change which observations are adjacent in the original trace.

The shortcut accepts an edge in either direction. That might be useful when checking whether two components can communicate, but the meaning here depends on time. A service can go from accepted to complete without being allowed to go back from complete to accepted. A trace that includes both directions lets you test the distinction without adding any unrelated status logic.

Expect a follow-up about repeated states. Seeing the same status twice is a transition in this fixture, so it needs an explicit pair. Also explain why the answer uses the later index. That index is where a report viewer needs to look to see the unexpected observation.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
