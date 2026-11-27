---
title: Report a shipment email that waits too long in the queue
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the delay if tracking still works in the app?
    choices:
      - { id: s4, text: "S4: The problem affects only the appearance of the information." }
      - { id: s1, text: "S1: The problem involves lost shipment or tracking data." }
      - { id: s3, text: "S3: A secondary channel has trouble, but app tracking works." }
      - { id: s2, text: "S2: Tracking is unavailable through every supported channel." }
  - id: priority
    type: single-choice
    prompt: What priority fits the evidence under the policy for single and repeated delays?
    choices:
      - { id: p2, text: "P2: Fix it in the next planned release." }
      - { id: p1, text: "P1: Fix it during the current sprint." }
      - { id: p0, text: "P0: Start the incident response right away." }
  - id: component
    type: single-choice
    prompt: Which part of the system handles the period where the delay occurs?
    choices:
      - { id: carrier, text: "The process that imports tracking from the carrier" }
      - { id: inbox, text: "The inbox customers see in the app" }
      - { id: provider, text: "Email delivery after the outside provider accepts the message" }
      - { id: queue, text: "The queue of notifications that are waiting to send" }
  - id: title
    type: single-choice
    prompt: Which title says what happened without guessing the cause?
    choices:
      - { id: blame, text: "The worker team is failing to pick up email jobs" }
      - { id: vague, text: "Something is wrong with the notifications about shipped orders" }
      - { id: precise, text: "Shipment email waits over 20 minutes before the provider accepts it" }
      - { id: long, text: "Staging build 313 queued three test shipment emails at 10:00 UTC and updated the in-app inbox at once. The provider accepted the emails 22 minutes later." }
  - id: steps
    type: ordering
    prompt: Put the steps in order from marking the order shipped to measuring the delay.
    choices:
      - { id: record, text: "Note when the email joins the queue and when app tracking appears." }
      - { id: compare, text: "Work out how much time passed and compare it with the five-minute target." }
      - { id: send, text: "With shipment email turned on, mark the test order shipped." }
      - { id: receipt, text: "Record the event where the provider accepts the shipment email." }
  - id: missing
    type: multi-select
    prompt: Which missing details would help a developer trace the wait in the queue?
    choices:
      - { id: correlation, text: "The test shipment, queue job and provider request IDs" }
      - { id: count, text: "The number of test shipments that had the delay" }
      - { id: attempts, text: "The job's attempts during the wait, with private details removed" }
      - { id: target, text: "The maximum promised time until the provider accepts email" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results belong in the report?
    choices:
      - { id: app, text: "Tracking should appear in the app right away. Instead, tracking never appears." }
      - { id: mail, text: "The provider should accept email within five minutes of queuing. Instead, it takes 22 minutes." }
      - { id: reject, text: "The provider should accept the email for delivery. Instead, it permanently rejects the address." }
      - { id: arrival, text: "The email should reach the inbox within five minutes of acceptance. Instead, it takes 22 minutes." }
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

> I saw tracking in the app. I got my shipment email much later.

The test used staging build 313 in Chrome 137 with a test mailbox and shipment email turned on. Staging is the test environment. The queue holds messages waiting to go to the email provider.

For each of three test orders, the notification log shows that the app queued the email at 10:00 UTC. The provider accepted each email at 10:22 UTC. A screenshot shows tracking was already visible in the app. The target is five minutes from joining the queue to the provider accepting the email. The effect on the live system is unknown.

Severity tells how serious the bug is:

- S1: Lost shipment or tracking data.
- S2: Tracking is unavailable through every supported channel, or way to get tracking.
- S3: A secondary channel has trouble. The main status channel still works.
- S4: Only appearance is affected.

Priority tells when to fix it:

- P0: If live tracking is down, start the incident response.
- P1: If the delay repeatedly exceeds the target, fix it this sprint, the team's current work period.
- P2: If there is only one unconfirmed delay, deal with it in the next release.
