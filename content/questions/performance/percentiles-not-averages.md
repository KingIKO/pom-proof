---
title: Each API call for the account dashboard takes 100 ms on average. What else would you report?
topic: performance
roles: [automation, sdet]
level: mid
type: concept
oneLine: I'd report response times for typical and slow requests, plus how many requests finish or fail. I'd also time the full dashboard load.
looksFor:
  - Use p50 for a typical wait and p95 and p99 to show how long slower requests take.
  - Report completed work and failures at the same load as the response times.
  - Explain how calls made one after another add to the wait and give users more chances to hit a slow call.
  - Time the whole page instead of adding response time percentiles from individual endpoints.
trap: Using the average alone to decide whether the dashboard is fast enough.
followUps:
  - question: Why might latency appear lower during a bad run?
    answer: >-
      If failed requests return quickly, the combined latency I report can look better.
      I'd report the error rate and show response times separately for successful and failed requests.
sources:
  - label: Google SRE, service level objectives and latency percentiles
    url: https://sre.google/sre-book/service-level-objectives/
  - label: Google SRE, four golden signals and tail latency
    url: https://sre.google/sre-book/monitoring-distributed-systems/
---

I'd report latency, the time a request takes, using percentiles. A percentile gives the time within which a given share of requests finish. The median, or p50, shows a typical request. The p95 and p99 show longer waits. A p95 of 300 ms means about 95 percent of measured requests finished within 300 ms.

The mean, or average, can look fine when most responses are fast and a few are much slower. I'd report completed requests per second and the error rate from the same period. I'd include how many requests I measured when I report the slow end.

I'd time how long it takes for the dashboard to be ready to use. If the dashboard waits for one API reply before sending the next request, those waits add up. A page that needs more calls also has more chances to hit a slow one. Adding the p99s for individual calls won't give me the page's p99.

### Example

Suppose I time 100 calls and 98 take 50 ms. The other two take 2,550 ms, so the mean is 100 ms. The difference between p95 at 50 ms and p99 at 2,550 ms shows how much longer some people wait. I'd time the dashboard from opening it until it shows the account totals.
