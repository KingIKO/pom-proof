---
problem: scenario/notification-email-retry
---

## What is going on

One shipment event creates an in-app notice and may create an email. If the same event arrives again, it must create neither a second notice nor a second email. Opting out of email still leaves the in-app notice enabled.

## The answer

1. Ask what identifies one event, when the worker reads preferences, and whether those preferences apply to the in-app notice.

   **Why:** The worker is the background job that sends the messages. Two shipments under one order can have different event IDs. A member might also change a preference while a job waits in the queue. That case needs a defined result before you can call it a defect.

2. Spend seven minutes on replaying one event and five minutes on a saved opt-out.

   Replay, or send again, one event ID for a member with email on. Check the mailbox and in-app inbox counts. Send a fresh event to a member with a saved opt-out and check both channels.

   **Why:** Replay catches duplicate delivery in either channel. The opt-out check catches email sent against the member's preference. It also catches a rule applied too broadly that suppresses the in-app notice.

3. Use the event API, and check the real worker's results in the mailbox and the in-app inbox independently.

   **Why:** Seeing one item in the app gives no evidence of how many emails the worker sent.

4. Use a unit table for the pure rule that maps saved preferences to channels.

   **Why:** A unit table feeds fixed inputs to the rule and lists the expected channels. The rule is pure, so testing its inputs directly isolates the decision. A separate event with a stored preference checks whether the worker applies that decision correctly.

5. If the same event ID sends two emails to the same enabled member, stop the rollout.

   **Why:** Delivery to the worker can repeat without a new shipment. The customer would then receive false extra notifications.

6. Check both notification channels after replaying the same shipment event.

   Enable shipment email for a member with empty test inboxes. After processing the event once, record the message counts and IDs. Replay the event with the same ID and wait for the job to finish. Then compare both channels with the first run.

   **Why:** The baseline ties any new message to the replay instead of to earlier activity. Job completion tells you when the absence of a duplicate is meaningful.

## Why the tempting answer fails

Preview length does not tell you when preferences apply. Checking email layout is useful after the opt-out rule is covered. The UI cannot directly observe both outputs of the worker. An API check adds dependencies that do not belong in a test of the pure channel decision.

## What the interviewer listens for

Explain how you identify a repeated event and how you know the worker has finished.

## Sources

- [ISTQB CTFL syllabus v4.0.1, test levels (2.2.1) and risk-based testing (5.2)](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
