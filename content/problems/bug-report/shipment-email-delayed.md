---
title: Report a shipment email held back by the queue
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
items:
  - id: severity
    type: single-choice
    prompt: Which severity fits a late email with correct tracking in the app?
    choices:
      - { id: s4, text: "S4, cosmetic only" }
      - { id: s1, text: "S1, lost shipment or tracking data" }
      - { id: s3, text: "S3, secondary channel impaired while primary status works" }
      - { id: s2, text: "S2, tracking blocked in all supported channels" }
  - id: priority
    type: single-choice
    prompt: What fix priority follows the repeated-delay policy?
    choices:
      - { id: p2, text: "P2, next planned release" }
      - { id: p1, text: "P1, current sprint" }
      - { id: p0, text: "P0, incident response now" }
  - id: component
    type: single-choice
    prompt: Which component best matches the interval where the delay appears?
    choices:
      - { id: carrier, text: "Carrier tracking import" }
      - { id: inbox, text: "Customer in-app inbox" }
      - { id: provider, text: "External mail delivery after provider acceptance" }
      - { id: queue, text: "Outbound notification queue" }
  - id: title
    type: single-choice
    prompt: Which title captures the symptom without guessing why?
    choices:
      - { id: blame, text: "Worker team is failing to pick up email jobs" }
      - { id: vague, text: "Shipment notifications are bad" }
      - { id: precise, text: "Shipment email waits over 20 minutes before provider acceptance" }
      - { id: long, text: "Build 313 in staging placed three test shipment emails in the notification queue at 10:00 UTC and the provider accepted them 22 minutes later although the in-app inbox updated at once" }
  - id: steps
    type: ordering
    prompt: Order the run from a fresh shipment event through the timing calculation.
    choices:
      - { id: record, text: "Record the enqueue time and the appearance of tracking in the app." }
      - { id: compare, text: "Calculate elapsed time against the five-minute target." }
      - { id: send, text: "Mark the fixture order shipped with shipment email enabled." }
      - { id: receipt, text: "Capture the provider-accepted event for that shipment email." }
  - id: missing
    type: multi-select
    prompt: Which missing details help a developer correlate the slow queue interval?
    choices:
      - { id: correlation, text: "Test shipment, queue job, and provider request IDs" }
      - { id: count, text: "Number of affected test shipments" }
      - { id: attempts, text: "Redacted job attempt history across the wait" }
      - { id: target, text: "Promised maximum time to provider acceptance" }
  - id: expected
    type: single-choice
    prompt: What expected versus actual result belongs in the ticket?
    choices:
      - { id: app, text: "Expected tracking immediately in the app; actual no tracking ever appears." }
      - { id: mail, text: "Expected provider acceptance within five minutes; actual acceptance follows enqueue by 22 minutes." }
      - { id: reject, text: "Expected the provider to accept delivery; actual the provider permanently rejects the address." }
      - { id: arrival, text: "Expected inbox arrival within five minutes of provider acceptance; actual arrival follows acceptance by 22 minutes." }
reference:
  severity: s3
  priority: p1
  component: queue
  title: precise
  steps: [send, record, receipt, compare]
  missing: [correlation, attempts]
  expected: mail
decoy:
  severity: s3
  priority: p2
  component: provider
  title: long
  steps: [send, record, receipt, compare]
  missing: [correlation, count]
  expected: arrival
---

> Tracking appeared in the app, but my shipment email was much later.

Staging build 313, Chrome 137, fixture mailbox, shipment email enabled. For each of three test orders, the notification log shows enqueue at 10:00 UTC and provider acceptance at 10:22 UTC. A screenshot shows tracking already visible in the app. The service target is five minutes from enqueue to provider acceptance. Production impact is unknown.

Severity: S1 lost shipment or tracking data; S2 tracking unavailable in all supported channels; S3 secondary channel impaired while primary status works; S4 cosmetic only. Priority: P0 incident response for production tracking outages; P1 current sprint for a repeated service-target miss; P2 next release for one unconfirmed delay.
