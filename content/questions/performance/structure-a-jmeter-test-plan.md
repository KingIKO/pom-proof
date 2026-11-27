---
title: Why does JMeter say the departure board is healthy when riders see empty results?
topic: performance
roles: [automation, sdet]
level: mid
type: concept
oneLine: Assert that the board has usable data and pace the requests like riders who read before clicking.
looksFor:
  - Uses the Thread Group for concurrent users and the time it takes to start them.
  - Puts requests in samplers and shares defaults and input data through configuration elements.
  - Sets the scope of timers and assertions deliberately.
  - Uses listeners to collect results and runs the load from the command line.
trap: Using the thread count as if it were the number of requests per second.
followUps:
  - question: The two-second pause shows up before the board loads instead of before train 624 opens. Where would you move it?
    answer: >-
      I'd put the timer under the details sampler. That gives the rider time to read the
      board after it loads. I'd check the request timestamps in a small run before repeating
      the load test.
sources:
  - label: Apache JMeter, elements and scoping of a test plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
  - label: Apache JMeter, running load tests in CLI mode
    url: https://jmeter.apache.org/usermanual/get-started.html#load_test_running
  - label: Grafana k6, iteration time and throughput in a closed model
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
---

A fast response that says there's no train is wrong if the selected station has departures. I'd
add an assertion to the board sampler that checks a known train for that station. I'd feed the
station data through a configuration element and use HTTP Request Defaults for the shared host.

Then I'd check what the test actually asks of the app. The Thread Group controls the rider count
and ramp-up. I'd scope the reading delay to the details sampler and leave the initial search
undelayed. Removing that pause changes the traffic even at the same thread count. I'd debug a
small run in the GUI and save sample results with a listener when I run the load from the CLI.

### Example

I seed a station where train 624 is due at noon. The board assertion fails if that train is
missing even when the page returns HTTP 200. A two-second timer under the details sampler gives
the rider time to read the board. I compare throughput and latency only with runs using the
same pace and station mix.
