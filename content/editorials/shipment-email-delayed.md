---
problem: bug-report/shipment-email-delayed
---

## What is going on

For each of three staging shipments, tracking is already visible in the app. The queue holds messages that wait to be sent. These messages entered the queue at 10:00 UTC. The mail provider accepted them at 10:22 UTC. The production impact and the recipients' inbox arrival time are unknown.

## The answer

1. Set severity to S3, a secondary channel is impaired while the primary channel works.

   **Why:** Severity describes how much harm the defect causes. Customers can still get tracking in the app. However, the shipment email misses its service target.

2. Set priority to P1, the current sprint.

   **Why:** Priority says how soon to fix the defect. Three test orders missed the target. So this meets the stated repeated-delay policy, not the rule for one unconfirmed delay.

3. Start with the outbound notification queue.

   **Why:** The measured delay begins at enqueue, when the message enters the queue. It ends at provider acceptance. The job history can show where time built up before that acceptance.

4. Choose a title that says more than 20 minutes pass before the provider accepts the shipment email.

   Keep the build, examples and times in the report.

   **Why:** A worker is the background process that picks up queued jobs. The title shows the symptom and the measured end point without guessing what the worker did.

5. Measure the wait for provider acceptance on an email-enabled fixture order, a prepared test order.

   Mark that order as shipped. Record when the app queues the email and when tracking appears. Capture the provider's acceptance event for that same email. Calculate the interval and compare it with the five-minute target.

   **Why:** Pairing events for one shipment makes the duration reproducible. It also shows separately that the primary tracking path works.

6. Request evidence that links the shipment to the provider and shows the job's attempts.

   Ask for the test shipment, queue job and provider request IDs. Ask for the redacted history of job attempts, with private details removed.

   **Why:** Those IDs join the events across components. The attempt history can separate time spent idle from time spent retrying unsuccessful sends.

7. Record that acceptance should follow enqueue within five minutes, but took 22 minutes.

   **Why:** Both values cover the same interval. The logs do not say how long delivery to the customer's inbox took.

## Why the tempting answer fails

The decoy's P2 gives too little weight to the repeated misses. The decoy also routes to external delivery after acceptance, which is outside the measured interval. The long title packs timestamps into the headline.

Keep the correlation IDs and request the job history. The report already gives the number of test orders and the target. The decoy's S3 and reproduction steps fit. Its inbox-arrival comparison does not.

## What the interviewer listens for

Name the start and end events. Compare only that interval with its target. Leave unmeasured delivery timing out of the conclusion.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
