---
title: A shipment stays pending after a carrier error. What should the test show the engineer on call?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd connect the failed carrier call to the decision about retrying. I'd also check that a lasting failure sends an alert to the right inbox.
looksFor:
  - Link the pending shipment to the carrier failure and the worker's decision about retrying.
  - Find the matching log with the trace ID without exposing customer addresses.
  - Check overall failure rates and response times to see whether the problem is spreading.
  - Test when an alert fires separately from whether staging delivers it to the test inbox.
trap: Assuming a successful reply proves someone can find the failure or will get an alert.
followUps:
  - question: The carrier alert fires in staging, but the test inbox is empty. What would you check?
    answer: I'd inspect where the system sends notifications and send a staging alert to that address. The rule test tells me when the alert fires. It doesn't tell me whether the alert arrives.
sources:
  - label: OpenTelemetry signals
    url: https://opentelemetry.io/docs/concepts/signals/
  - label: OpenTelemetry log trace context fields
    url: https://opentelemetry.io/docs/specs/otel/logs/data-model/
  - label: Prometheus unit testing for alert rules
    url: https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/
---

I'd cause a known failure and take its trace ID, the key linking records from the same flow. I'd use it to find the carrier span, the record of that call within the trace. I'd look for the same ID in the worker log from the program that handles the shipment. I'd expect that log to say whether the worker will retry or leave the shipment pending.

I'd check that neither record exposes customer addresses or sign-in secrets. I'd use overall measurements to see if updates fail more often or take longer than usual.

I'd include those signals in the checks the feature must pass. I'd use rule tests in Prometheus, a monitoring tool, to feed sample measurements to the alert rules. I'd check that brief errors stay quiet and lasting failures trigger an alert. In staging, I'd check where the notification goes without causing a problem in production.

### Example

In staging, I'd have a test carrier return an error. I'd expect the trace to show the failed call and the worker log to record whether it will retry. I'd feed the alert rule sample failures above its limit for long enough to trigger it. I'd check that a staging alert reaches the test inbox.
