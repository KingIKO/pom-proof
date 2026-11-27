---
title: The new city adds 10 checkouts per second, and an opening offer could add 15 more. Which load must pass?
topic: performance
roles: [sdet, senior]
level: senior
type: concept
oneLine: Agree whether the promotion is part of launch, then set a pass condition for the demand the business plans to serve.
looksFor:
  - Separates the launch requirement from the opening-offer scenario.
  - Gets agreement on checkout latency, errors, and sustained duration before testing.
  - Uses a comparable city peak to explain the starting rate.
  - Gives a range based on expected activity if there is no comparable city.
trap: Choosing a round user count and deciding whether it passed after seeing the charts.
followUps:
  - question: Marketing confirms the offer will run on opening night. How does that change the 65-start test?
    answer: >-
      I'd ask the launch owner to make 65 an explicit pass case for the offer window. I'd
      record the assumptions, test slower and faster arrival estimates, and revise the forecast
      using early rollout traffic.
sources:
  - label: Google SRE, launch capacity planning and overload tests
    url: https://sre.google/sre-book/reliable-product-launches/
  - label: Google SRE, demand forecasts in capacity planning
    url: https://sre.google/sre-book/software-engineering-in-sre/
  - label: Grafana k6, defining load test goals and workloads
    url: https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/
---

I'd start with the busiest short windows from comparable cities. I'd record order placement
separately from browsing and cart updates. Then I'd add the expected launch demand and leave
headroom for a promotion or growth. I'd keep the assumptions visible so we can revise the targets
when we have better numbers.

If this were the first city, I'd start with expected active users during the busiest interval and
estimate how many times each starts an order in that window. I'd use a low and high estimate and
include a short burst if marketing expects people to arrive together. Before testing, I'd agree
with the business on the load and duration the service must sustain. I'd set latency and error
limits that define a pass at that load.

### Example

If checkout peaks at 40 starts per second and the new city is forecast to add 10, I'd propose
50 starts per second as the launch case. If an opening offer is expected to add another 15, I'd
test 65 as a separate case. Whether 65 must pass or is just for diagnosis is a decision I'd get
written down before running it.
