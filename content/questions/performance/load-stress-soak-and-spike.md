---
title: Which performance tests would you run before a museum opens ticket sales?
topic: performance
roles: [automation, sdet]
level: junior
type: concept
oneLine: I'd pick a traffic pattern based on what I need to learn about the ticket service.
looksFor:
  - Run a small smoke test to check the setup before drawing conclusions about speed.
  - Explain how a stress test at high demand differs from a breakpoint test that finds the limit.
  - Use a spike test to mimic a sudden rush and check whether the service recovers.
  - Explain how a soak test uses several hours of steady traffic to spot worsening speed or resource use.
trap: Calling a brief rush a soak test just because it sends many requests.
followUps:
  - question: Would a passing announcement spike test tell you how big the next sale can be?
    answer: >-
      I'd know how it handled that specific rush.
      I'd raise demand in a separate breakpoint test to see when the site misses its targets.
      I'd use a test environment I can throw away afterward.
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

For opening day, I'd run a spike test to see whether the page recovers after a sudden rush. Before I use its results, I'd run a small smoke test to make sure the script works. I'd also run an average-load test to measure response times and errors at expected demand.

If the team asks about a busy afternoon with more traffic than average, I'd run a stress test at that load. If they need to know the limit, I'd run a breakpoint test that raises demand until the service misses its targets. In a soak test, I'd hold the load steady for hours. I'd check whether memory use keeps rising or requests get slower.

### Example

I'd use k6 to test the local museum API at `/api/tickets/availability`, the address that serves ticket availability. I'd raise the number of visitors using the site at once from two virtual users to twelve. Then I'd drop it back to two. The rush represents people following the same sale announcement.

I'd expect HTTP 200 replies, meaning the requests succeeded. I'd check that response times return near their starting level once only two users remain.
