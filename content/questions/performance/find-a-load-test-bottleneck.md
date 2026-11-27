---
title: The search gateway looks healthy but orders are slow. Would you raise the database pool size?
topic: performance
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Find where requests wait and make sure there is downstream capacity before changing the connection pool.
looksFor:
  - Uses traces to tell connection acquisition time from time spent running a query.
  - Checks whether the database can take more connections without moving the wait downstream.
  - Finds where tail latency rises while completed throughput stops keeping pace.
  - Verifies the generator delivered the planned load before comparing runs.
trap: Buying a larger database because its CPU graph is the first one you opened.
followUps:
  - question: At 180 requests per second, the larger pool cuts acquisition time but p95 stays flat. Would you keep it?
    answer: >-
      I'd compare query time and database queue depth with the first run. If I only moved the
      wait and gained no throughput, I wouldn't keep the extra connections on that evidence.
sources:
  - label: Grafana k6, monitoring the load generator
    url: https://grafana.com/docs/k6/latest/testing-guides/running-large-tests/
  - label: Google SRE, saturation and latency as an early signal
    url: https://sre.google/sre-book/monitoring-distributed-systems/
  - label: OpenTelemetry, traces and spans
    url: https://opentelemetry.io/docs/concepts/signals/traces/
  - label: Google SRE, controlled troubleshooting experiments
    url: https://sre.google/sre-book/effective-troubleshooting/
---

I'd find out where the time goes before making the pool bigger. If traces show that requests
wait to get a connection and the database has spare capacity, the change is worth testing.
If the queries themselves are waiting on locks, another connection may just join that queue.

I'd check the generator's CPU, memory, and network and compare its actual rate with what the
service received. Once I trust the load, I'd look at the step where tail latency started to rise
and completed throughput fell behind. I'd line up traces with pool and database metrics for
that window, then change only what the evidence points to.

### Example

Suppose search latency jumps at 180 requests per second. Gateway time is flat, but slow traces show
connection acquisition taking hundreds of milliseconds while the application's database pool is
full. I'd first check whether the database has spare capacity. If it does, I'd adjust only the pool
size in the test environment and replay the same traffic. I'd compare tail latency and throughput
and check whether the wait moved to the database.
