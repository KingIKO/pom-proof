---
title: The account dashboard averages 100 ms per API call. What would you report alongside that?
topic: performance
roles: [automation, sdet]
level: mid
type: concept
oneLine: Report latency percentiles with throughput and failures, and time the full dashboard load.
looksFor:
  - Explains the typical case using p50 and the slow tail using p95 and p99.
  - Puts latency in the context of completed work and failures at the same load.
  - Recognizes that sequential calls add elapsed time and expose users to more chances of a slow call.
  - Measures the whole page without adding endpoint percentiles together.
trap: Using a single mean to sign off on the dashboard's speed.
followUps:
  - question: Why would latency fall during a bad run?
    answer: >-
      Fast failures can make a combined latency figure look better. Report the error rate
      and split latency for successful and failed requests.
sources:
  - label: Google SRE, service level objectives and latency percentiles
    url: https://sre.google/sre-book/service-level-objectives/
  - label: Google SRE, four golden signals and tail latency
    url: https://sre.google/sre-book/monitoring-distributed-systems/
---

I'd report the median, or p50, for a typical request and p95 and p99 for the slow end. A p95 of
300 ms means about 95 percent of measured requests finished within 300 ms. The mean can look fine
when most responses are fast and a small fraction are much slower. I'd show completed requests per
second and the error rate from the same window. I'd include the sample size when reporting the tail.

I'd also measure when the dashboard is ready to use. If it waits for one API reply before making the
next request, those waits add up. The more calls a page needs, the more chances it has to hit a slow
one. I'd measure that page latency directly because adding individual p99s won't give me the
page's p99.

### Example

Suppose 98 of 100 calls take 50 ms and two take 2,550 ms. The mean is 100 ms. The difference
between p95 at 50 ms and p99 at 2,550 ms shows how much worse that wait can get. I'd time the
dashboard from opening it to showing its account totals.
