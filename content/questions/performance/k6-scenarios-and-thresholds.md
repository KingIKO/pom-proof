---
title: How would you make a k6 run fail CI when the event seat map is too slow?
topic: performance
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd schedule when test visitors start and label the measurements for each endpoint. I'd set a separate pass limit for the seat map.
looksFor:
  - Set a response time limit for the seat map so fast event details can't hide a slow map.
  - Label requests and checks by endpoint so you can set separate pass limits.
  - Check that every scheduled visit started.
  - Explain why recording a bad reply doesn't automatically fail the automated run.
trap: Checking reply status only and taking a zero k6 exit code as proof that the run passed.
followUps:
  - question: What does a nonzero dropped iteration count tell you?
    answer: >-
      I'd know some scheduled visits never started. Those missed starts are dropped iterations.
      I'd check how many virtual users k6 could use to start visits.
      I'd see whether slower requests kept them busy before blaming either the test tool or the service.
sources:
  - label: Grafana k6, constant arrival rate and virtual user allocation
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-arrival-rate/
  - label: Grafana k6, thresholds, tags, and process exit status
    url: https://grafana.com/docs/k6/latest/using-k6/thresholds/
  - label: Grafana k6, check function and metric tags
    url: https://grafana.com/docs/k6/latest/javascript-api/k6/check/
  - label: Grafana k6, HTTP GET
    url: https://grafana.com/docs/k6/latest/javascript-api/k6-http/get/
  - label: Grafana k6, HTTP request tags
    url: https://grafana.com/docs/k6/latest/javascript-api/k6-http/params/
  - label: Grafana k6, dropped iterations
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/dropped-iterations/
examples:
  - title: One arrival rate, separate endpoint thresholds
    variants:
      - lang: js
        label: k6 (JavaScript)
        code: |
          import http from 'k6/http';
          import { check } from 'k6';

          const event = 'http://127.0.0.1:3000/api/events/42';

          export const options = {
            scenarios: {
              browse_event: {
                executor: 'constant-arrival-rate',
                rate: 8,
                timeUnit: '1s',
                duration: '30s',
                preAllocatedVUs: 10,
              },
            },
            thresholds: {
              'checks{endpoint:event_details}': ['rate>0.99'],
              'checks{endpoint:seat_map}': ['rate>0.99'],
              'http_req_duration{endpoint:seat_map}': ['p(95)<350'],
              dropped_iterations: ['count<1'],
            },
          };

          export default function () {
            for (const [url, endpoint] of [[event, 'event_details'], [`${event}/seats`, 'seat_map']]) {
              const tags = { endpoint };
              const response = http.get(url, { tags });
              check(response, { 'returns 200': ({ status }) => status === 200 }, tags);
            }
          }
---

I'd set a response time threshold for seat map requests alone. A threshold is a limit the run must meet to pass. I'd use tags, or labels, to group requests and status checks by endpoint, the address each request goes to. That way, fast event details can't hide a slow seat map.

A failed check records a bad reply. A failed threshold returns a nonzero exit code, which tells CI, the automated test system, to fail the job.

I'd require the test to send the planned traffic. With a constant-arrival-rate scenario, k6 starts visits at a steady pace while it has virtual users available to run them. I'd check for dropped iterations to see if the run met that plan. I count visits separately from requests because each visit reads both endpoints.

### Example

I use a local ticket API with event 42 and a seat map set up as test data. I'd schedule eight visits per second and have each visit read both endpoints. The run must start every visit. At each endpoint, more than 99 percent of checks must get HTTP 200, a successful reply.

I'd require a seat map p95 under 350 ms, even if event details are much faster. The p95 is the time within which about 95 percent of requests finish.
