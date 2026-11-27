---
title: Which performance tests would you run before a museum opens ticket sales?
topic: performance
roles: [automation, sdet]
level: junior
type: concept
oneLine: Pick the traffic pattern that answers the question you have about the ticket service.
looksFor:
  - Uses a small smoke run to validate the setup before making performance claims.
  - Separates above-average demand in a stress test from a search for the limit in a breakpoint test.
  - Matches a sudden ticket announcement to a spike test and checks recovery.
  - Uses elapsed time and resource trends to explain why a soak test catches a different problem.
trap: Calling a brief burst a soak test because it sends many requests.
followUps:
  - question: Would a clean announcement spike tell you how large the next sale can be?
    answer: >-
      It would tell me about that particular burst. I'd use a separate breakpoint run in a
      disposable environment to see where the service stops meeting its targets as demand rises.
sources:
  - label: Grafana k6, load test types
    url: https://grafana.com/docs/k6/latest/testing-guides/test-types/
  - label: Grafana k6, soak testing
    url: https://grafana.com/docs/k6/latest/testing-guides/test-types/soak-testing/
  - label: Grafana k6, spike testing and recovery
    url: https://grafana.com/docs/k6/latest/testing-guides/test-types/spike-testing/
  - label: Grafana k6, ramping virtual users
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ramping-vus/
  - label: Grafana k6, HTTP GET
    url: https://grafana.com/docs/k6/latest/javascript-api/k6-http/get/
  - label: Grafana k6, response checks
    url: https://grafana.com/docs/k6/latest/using-k6/checks/
  - label: Grafana k6, sleep
    url: https://grafana.com/docs/k6/latest/javascript-api/k6/sleep/
examples:
  - title: A short burst on the ticket availability route
    variants:
      - lang: js
        label: k6 (JavaScript)
        code: |
          import http from 'k6/http';
          import { check, sleep } from 'k6';

          export const options = {
            scenarios: {
              ticket_burst: {
                executor: 'ramping-vus',
                startVUs: 2,
                stages: [
                  { duration: '10s', target: 2 },
                  { duration: '1s', target: 12 },
                  { duration: '5s', target: 12 },
                  { duration: '1s', target: 2 },
                  { duration: '15s', target: 2 },
                ],
              },
            },
          };

          export default function () {
            const response = http.get('http://127.0.0.1:3000/api/tickets/availability');
            check(response, { 'availability returns 200': ({ status }) => status === 200 });
            sleep(1);
          }
---

For opening day I'd want to know whether the ticket page recovers after a sudden rush. That's a
spike test. Before interpreting it, I'd run a small smoke test to make sure the script works, then
use an average-load test to establish response time and errors at expected demand.

If the team asks how the service handles a busy afternoon above expected average load, I'd run a
stress test at that level. If they ask how far the system can go before it misses its targets, I'd
run a breakpoint test. A soak test answers a question about time: after hours at steady load, is
memory still climbing or are requests getting slower?

### Example

The local museum API serves ticket availability at `/api/tickets/availability`. The k6 script raises
concurrency from two virtual users to twelve, then drops it back to two. I expect HTTP 200 replies
and want latency back near its starting level during the final stage. The burst represents visitors
following a ticket sale announcement at the same time.
