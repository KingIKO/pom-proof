---
title: Why can a JMeter test pass when riders see an empty departure board?
topic: performance
roles: [automation, sdet]
level: mid
type: concept
oneLine: I'd check that the board shows usable data. I'd also let each simulated rider pause to read it before opening train details.
looksFor:
  - Set the rider count and how quickly riders start in the Thread Group.
  - Define the requests in samplers and put shared settings and inputs in configuration elements.
  - Apply delays and checks only to the requests that need them.
  - Collect results with a listener and run the load test from the command line.
trap: Treating the number of simulated riders as the number of requests per second.
followUps:
  - question: The two-second pause delays the board load. Where would you move it so it delays opening train 624 instead?
    answer: >-
      I'd attach the timer to the sampler that sends the details request.
      That gives the rider time to read the board after it loads.
      Before repeating the load test, I'd check when requests go out in a small run.
sources:
  - label: Apache JMeter, elements and scoping of a test plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
  - label: Apache JMeter, running load tests in CLI mode
    url: https://jmeter.apache.org/usermanual/get-started.html#load_test_running
  - label: Grafana k6, iteration time and throughput in a closed model
    url: https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
---

If I know the station has departures, a fast reply with no trains is still wrong. I'd add an assertion, a check for a known train, to the sampler that sends the board request. I'd supply the station data through a configuration element, which provides shared inputs. I'd set the common server address in HTTP Request Defaults.

I'd use the Thread Group to set the rider count and ramp-up, the time it takes to start them. I'd put the reading delay on the details sampler so the initial search starts without waiting. Removing that pause changes the traffic even with the same rider count.

I'd use JMeter's graphical interface to debug a small run. For the load test, I'd run from the command line and save request results with a listener, which collects them.

### Example

I'd set up test data for a station where train 624 is due at noon. If that train is missing, my board check fails even when HTTP 200 says the request succeeded. I'd put a two-second timer on the details sampler to give the rider time to read. I'd compare response times and requests completed per second only across runs with the same pace and mix of stations.
