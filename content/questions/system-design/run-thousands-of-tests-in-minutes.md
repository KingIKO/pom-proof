---
title: The reservation tests got slower after you added CI workers. How would you fit them into six minutes?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: I'd make it safe to run tests together. I'd time a run to see whether a shared service or one group of tests limits the speed.
looksFor:
  - Check whether workers compete for accounts, records, or database connections.
  - Find rules that a test can check without opening the browser.
  - Leave time for startup and reports when estimating how many workers you need.
  - Use test times to shift work away from the group that finishes last.
trap: Dividing tests by count alone and adding workers until the shared test environment times out.
followUps:
  - question: What would you do if one test takes most of the time by itself?
    answer: Adding shards won't shorten that test. I'd check what it does to set up and where it waits. I'd split checks that can run apart or move suitable checks to the API.
sources:
  - label: Playwright sharding across machines
    url: https://playwright.dev/docs/test-sharding
---

In CI, the system that runs automated jobs, I'd check what each worker waits for. Workers are processes that run tests. I'd check for waits on shared reservation records or database connections. I'd give each worker separate data and check rules through the API when I don't need the browser. If the shared database still queues requests, adding workers can make that wait longer.

To estimate the worker count, I'd multiply the number of tests by their average duration. I'd divide by the time left after setup and reporting. I'd use workers I can discard after the run. I'd check the last shard to finish, the group of tests assigned to one job. If three test files take most of its time, I'd use past timings to spread them out before paying for another runner.

### Example

At four seconds each, I'd budget 14,400 worker-seconds for 3,600 tests. That's the total time spent by all workers. In ideal conditions, I'd need at least 40 workers at once to finish in six minutes. If I reserve a minute for setup and reporting, I'd start the estimate at 48. I'd check it with a run that reflects the suite.
