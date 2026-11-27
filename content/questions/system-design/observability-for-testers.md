---
title: A shipment stays pending after a carrier error. What evidence should its test leave for the on-call engineer?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Follow the failed carrier call to the worker's retry decision, then prove a sustained failure reaches the right inbox.
looksFor:
  - Connects the pending shipment to the failed carrier call and worker retry decision.
  - Uses the trace ID to find the relevant log without exposing customer addresses.
  - Uses aggregate failure and timing metrics to check whether the problem is spreading.
  - Separately checks when the alert fires and whether staging routes it to the test inbox.
trap: Assuming a successful response proves the failure can be diagnosed or that anyone will be paged.
followUps:
  - question: The carrier alert fires in staging but the test inbox stays empty. Where would you look next?
    answer: I'd inspect the notification route and send a staging alert to that recipient. The passing rule tells me when the alert fires; it doesn't prove delivery.
sources:
  - label: OpenTelemetry signals
    url: https://opentelemetry.io/docs/concepts/signals/
  - label: OpenTelemetry log trace context fields
    url: https://opentelemetry.io/docs/specs/otel/logs/data-model/
  - label: Prometheus unit testing for alert rules
    url: https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/
---

I'd take the trace ID from a controlled failure and find the carrier span. The worker log
should have the same ID and explain whether it will retry or leave the shipment pending.
I'd check that neither record exposes addresses or credentials. Metrics should show whether
updates are failing more often or taking longer than usual.

I'd make those signals part of the acceptance check. With Prometheus rule tests I'd verify
that brief errors stay quiet while sustained failures fire an alert. Then I'd check the
notification route in staging without causing a production incident.

### Example

In staging a test carrier returns an error. The trace shows the carrier call failed and the
worker log records the retry decision. I feed the alert rule sample data with failures above
the threshold long enough to fire, then confirm a staging alert lands in the test inbox.
