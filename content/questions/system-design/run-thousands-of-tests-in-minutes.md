---
title: More CI workers made reservation tests slower. Where would you spend the next six minutes?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Make the work safe to run concurrently and use a timed run to see whether shared services or a single shard set the floor.
looksFor:
  - Checks whether parallel workers fight over accounts, records, or database connections.
  - Identifies browser cases that can test the same rule below the UI.
  - Budgets for startup and reporting when estimating ideal capacity.
  - Uses measured test times to move work off the shard that finishes last.
trap: Splitting by test count and adding workers until the shared environment starts timing out.
followUps:
  - question: What if one test uses most of the time budget on its own?
    answer: More shards cannot shorten that test. I'd inspect its setup and waits, then split independent checks or move suitable assertions to the API.
sources:
  - label: Playwright sharding across machines
    url: https://playwright.dev/docs/test-sharding
---

I'd check whether workers are blocking on the same reservation records or waiting for database
connections. I'd isolate their data and move reservation rules that don't need a browser to the
API layer. If the shared database still queues requests, adding runners can increase the wait.

The estimate gives me a sanity check. Multiply the test count by the average duration, then
divide by the time available after setup and reporting. I'd use disposable workers and look
at the last shard to finish. If three specs dominate its timeline, I'd redistribute those
using their previous run times before paying for another runner.

### Example

At four seconds each, 3,600 tests need 14,400 worker-seconds. Six minutes calls for at least
40 concurrent workers in the ideal case. With a minute reserved for overhead, the estimate
starts at 48, and I'd check it with a representative run.
