---
problem: bug-report/shipment-email-delayed
---

## What is going on

Tracking is already visible in the app for each of three staging shipments. Their messages entered the queue at 10:00 UTC, and the mail provider accepted them at 10:22 UTC. Production impact and recipient inbox arrival time are unknown.

## The answer

1. Set severity to S3, a secondary channel is impaired while the primary channel works.

   **Why:** Customers can still get tracking in the app, but the shipment email misses its service target.

2. Set priority to P1, the current sprint.

   **Why:** Three test orders missed the target, so this meets the stated repeated-delay policy rather than the rule for one unconfirmed delay.

3. Start with the outbound notification queue.

   **Why:** The measured delay begins at enqueue and ends at provider acceptance. The job history can show where time accumulated before that acceptance.

4. Use the title “Shipment email waits over 20 minutes before provider acceptance.”

   **Why:** The symptom and measured endpoint are visible without guessing what the worker did. Keep the build, examples and times in the report.

5. Mark an email-enabled fixture order shipped, record enqueue and when tracking appears, capture the same email's provider-accepted event, then compute the interval against the five-minute target.

   **Why:** Pairing events for one shipment makes the duration reproducible and shows separately that the primary tracking path works.

6. Request the test shipment, queue job and provider request IDs, plus the redacted job attempt history.

   **Why:** Those IDs join the events across components. Attempts can distinguish time spent idle from time spent retrying unsuccessful sends.

7. Record that acceptance should follow enqueue within five minutes, but took 22 minutes.

   **Why:** Both values cover the same interval. The logs do not say how long delivery to the customer's inbox took.

## Why the tempting answer fails

P2 discounts the repeated misses, and external delivery after acceptance is outside the measured interval. The long title packs timestamps into the headline. Keep the correlation IDs and request job history. The report already gives the number of test orders and the target. S3 and the reproducer fit; the inbox-arrival comparison does not.

## What the interviewer listens for

Name the start and end events and compare only that interval to its target. Leave unmeasured delivery timing out of the conclusion.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
