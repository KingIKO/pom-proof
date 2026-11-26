---
problem: code/order-ci-checks
---

Count each job's distinct prerequisites and record which jobs depend on it. A job becomes ready when its prerequisite count reaches zero. After scheduling a ready job, decrement the counts of its dependents. If there are unscheduled jobs and none is ready, their prerequisites contain a cycle.

The shortcut sorts the initial set of ready jobs, then uses a first-in, first-out queue. It can produce a valid order that still violates the report's tie rule. Consider a ready job named `start` that releases job `a`, while job `z` is already waiting. The next job must be `a`, which a plain queue leaves behind `z`.

Explain the invariant in an interview: every remaining count equals the number of unscheduled prerequisites. That is why each distinct dependency contributes one decrement. This version scans sorted IDs for the next ready job, which is simple but can take quadratic time in the job count. For larger graphs, a minimum heap can choose the smallest ready ID without scanning the whole list each time.

[Related reference](https://docs.python.org/3/library/graphlib.html)
