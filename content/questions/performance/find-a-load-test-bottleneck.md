---
title: The search gateway looks healthy, but orders are slow. Would you allow more database connections?
topic: performance
roles: [sdet, senior]
level: senior
type: scenario
oneLine: I'd find where requests wait and check whether the database can handle more connections before changing the pool of connections.
looksFor:
  - Use records of each request's steps to tell a wait for a connection from a slow query.
  - Check whether more connections would move the wait to the database.
  - Find the load where slow requests take longer and fewer requests finish than arrive.
  - Before comparing runs, check that the tool sent the planned traffic.
trap: Buying a larger database because you looked at its CPU graph first.
followUps:
  - question: At 180 requests per second, getting a connection is faster with a larger pool. If p95 stays the same, would you keep it?
    answer: >-
      I'd compare query times and the number of requests waiting at the database with the first run.
      If I only moved the wait and finished no extra requests per second, I wouldn't keep the extra connections on that evidence.
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

I'd find where requests wait before increasing the database connection pool, the set of connections the app reuses. I'd use traces, which record the steps of each request. If requests wait for a connection and the database can do more work, I'd test a larger pool. If queries wait for locks that protect data during other work, more connections may just add to that wait.

I'd check CPU use, memory, and network activity on the load generator, the tool that sends test traffic. I'd compare what it sent with what the service received. I'd find where tail latency rose, meaning the slowest requests took longer. I'd also check where throughput, or requests completed per second, fell behind arrivals. I'd compare traces and measurements from the pool and database for that period.

I'd change only what the evidence points to.

### Example

Suppose search response times jump at 180 requests per second. The gateway, which passes requests to the service, takes the same time as before. The pool is full, and traces show requests wait hundreds of milliseconds to get a connection. If the database can do more work, I'd change only the pool size in the test environment. I'd send the same traffic again.

I'd compare throughput and p95, the time within which about 95 percent of requests finish. I'd also check whether the wait moved to the database.
