---
title: How would you make a k6 run fail CI when the event seat map is too slow?
topic: performance
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Schedule arrivals in a scenario and use tagged metrics to decide whether the run passes.
looksFor:
  - Defines a seat map latency target that fast event details cannot hide.
  - Gives checks and requests stable endpoint tags for separate thresholds.
  - Verifies that the scheduled journeys actually started.
  - Explains the difference between recording a bad reply and failing the CI run.
trap: Using status checks alone and treating a zero k6 exit code as a pass.
followUps:
  - question: What does a nonzero dropped iteration count tell you?
    answer: >-
      Some scheduled iterations never started. Check the virtual user allocation and whether
      slower requests kept those users busy before blaming the load generator or the service.
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

I'd put the latency requirement on seat map requests alone. If the event details route is fast,
its timings shouldn't rescue a slow seat map. I'd tag the HTTP requests and the status checks by
endpoint. A failed check records the bad response; a failed threshold gives CI a nonzero exit code.

I'd also require the run to deliver the planned workload. With a constant-arrival-rate scenario,
visitor starts keep their pace while virtual users are available. A dropped iteration means a
visitor never started. I count scheduled journeys separately from requests because the same
visitor reads both endpoints.

### Example

The local ticket API has event 42 and a seeded seat map. Each iteration reads both endpoints, with
eight iterations scheduled per second. The run should start every scheduled iteration and return
HTTP 200 on more than 99 percent of checks for each endpoint. The seat map's p95 request duration
must stay under 350 ms even if event details are much faster.
