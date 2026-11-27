---
title: The new city adds 10 checkout starts per second. An opening offer could add 15 more. What load must the service handle?
topic: performance
roles: [sdet, senior]
level: senior
type: concept
oneLine: I find out if the launch includes the offer. Then I agree with the business on what the service must handle to pass.
looksFor:
  - Separate the expected launch load from the extra traffic an opening offer could bring.
  - Agree before testing on acceptable checkout times, error limits, and how long the service must handle the load.
  - Use the busiest period in a similar city to explain the starting rate.
  - If no similar city exists, estimate a range from the activity you expect.
trap: Picking a round number of users and waiting until after the test to decide what counts as a pass.
followUps:
  - question: Marketing confirms the offer for opening night. How does that change the test at 65 checkout starts per second?
    answer: >-
      I'd ask the launch owner to require a pass at 65 starts per second for the offer period.
      I'd write down what I assumed. I'd also test lower and higher rates.
      I'd update the forecast using traffic from the early rollout.
sources:
  - label: Google SRE, launch capacity planning and overload tests
    url: https://sre.google/sre-book/reliable-product-launches/
  - label: Google SRE, demand forecasts in capacity planning
    url: https://sre.google/sre-book/software-engineering-in-sre/
  - label: Grafana k6, defining load test goals and workloads
    url: https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/
---

I'd start with short periods when similar cities were busiest. I'd count orders separately from browsing and cart changes. I'd add the demand I expect at launch. I'd also leave room for an offer or growth. I'd write down my assumptions so we can update the targets when we get better numbers.

If this were the first city, I'd estimate how many people use the service during the busiest period. I'd estimate how often each person starts an order then. I'd use both a low and a high estimate. If marketing expects people to arrive together, I'd include a short burst.

Before testing, I'd agree with the business on the load and how long the service must hold it. I'd set limits for checkout response time and errors at that load.

### Example

If checkout peaks at 40 starts per second and the new city adds an estimated 10, I'd propose 50 starts per second for launch. If I expect the offer to add another 15, I'd test 65 separately. Before running it, I'd record whether 65 must pass or is only for diagnosis. A run for diagnosis helps me see what happens at that load without making it a launch requirement.
