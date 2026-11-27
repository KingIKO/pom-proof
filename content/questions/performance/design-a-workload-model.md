---
title: The cafeteria menu loads fast, but meal reservations time out. What traffic would you test next?
topic: performance
roles: [sdet]
level: mid
type: concept
oneLine: I'd model traffic from the busiest lunch period and set separate speed and error targets for reservations.
looksFor:
  - Set clear response time and error limits for reservations.
  - Check whether new visitors keep arriving when earlier requests slow down.
  - Use actual visit counts and separate people who read the menu from people who reserve a meal.
  - Use varied data and realistic pauses so the test can show when requests compete for the same resources.
trap: Sending the same menu request for every visitor and treating that as a typical lunch rush.
followUps:
  - question: If you keep the number of active visitors fixed, why might a slowdown look less serious?
    answer: >-
      If the group waits for each visit to finish, I'd see fewer new visits start when the service slows down.
      If people would still arrive at the planned rate, I'd use an open model that starts visits independently.
sources:
  - label: Grafana k6, choosing a representative API workload
    url: https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/
  - label: Grafana k6, open and closed workload models
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
---

Before running the test, I'd agree on acceptable reservation response times and errors. I'd use logs from a few similar lunch periods to estimate how many people arrive. I'd also estimate what share reserve a meal. I'd include popular meals but spread orders across items and accounts. I'd keep the pause between reading the menu and choosing lunch.

If people keep opening the app at noon despite slow reservations, I'd use an open model. In an open model, new visits start without waiting for others to finish. I'd use a closed model for a fixed group that waits for a visit to finish before starting another. If I choose a closed model by mistake, it may make the service look healthier by sending less traffic as the service slows.

### Example

My logs show 300 new visits in the busiest minute. Four in five visitors only read the menu. I'd start about five visits a second. I'd let the other one in five pause, then reserve a meal from a varied menu. I'd measure reservation response times separately so fast menu reads can't hide slow reservations.
