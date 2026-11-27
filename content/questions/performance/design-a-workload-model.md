---
title: The cafeteria menu is fast but meal reservations time out. What traffic should the next test send?
topic: performance
roles: [sdet]
level: mid
type: concept
oneLine: Recreate the busiest lunch window and give reservations their own performance target.
looksFor:
  - Gives the reservation path explicit latency and error targets.
  - Models whether fresh lunch traffic keeps arriving when old requests slow down.
  - Uses observed session starts and distinguishes readers from people reserving a meal.
  - Keeps decision time and data variety realistic enough to expose contention.
trap: Sending the same menu request from every user and calling it a lunch simulation.
followUps:
  - question: Why might fixed concurrency understate the effect of a slowdown?
    answer: >-
      With a fixed group that waits for each journey to finish, slower journeys reduce the rate
      of new ones. Use an open model if new sessions would keep starting at the planned rate.
sources:
  - label: Grafana k6, choosing a representative API workload
    url: https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/
  - label: Grafana k6, open and closed workload models
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
---

I'd agree on acceptable reservation latency and errors before running anything. Then I'd use logs
from a few comparable lunch periods to estimate how many people arrive and what share reserve a meal.
I'd include popular items without making every order hit a single item or account. I'd also keep
the gap between reading the menu and choosing lunch.

If people keep opening the app at noon even when earlier reservations are slow, I'd use an open
model. A closed model fits a fixed group that waits for the previous journey to finish. Choosing
that model by accident can make the service look healthier by reducing demand as it slows down.

### Example

Logs show 300 new sessions in the busiest minute. Four in five only read the menu. I'd start about
five sessions a second and let the other one in five pause before reserving from a varied menu.
I'd judge reservation latency separately so fast menu reads don't drown it out.
