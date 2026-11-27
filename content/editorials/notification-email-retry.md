---
problem: scenario/notification-email-retry
---

## What is going on

One shipment event creates an in-app notice and may create an email. Repeating that event must create neither again. Opting out of email still leaves the in-app notice enabled.

## The answer

1. Ask what identifies one event, when the worker reads preferences, and whether those preferences apply to the in-app notice.

   **Why:** Two shipments under one order can have different event IDs. A preference change while a job is queued also needs a defined result before you can call it a defect.

2. Spend seven minutes replaying one enabled member's event ID and checking both channels. Spend five sending a fresh event with a saved opt-out and checking both channels.

   **Why:** Replay catches duplicate delivery in either channel. Opt-out catches wrongly sent email and a rule applied too broadly that suppresses the in-app notice as well.

3. Use the event API and check the real worker's mailbox and inbox outcomes independently.

   **Why:** Seeing one item in the app gives no evidence of how many emails the worker sent.

4. Use a unit table for the pure preference-to-channel rule.

   **Why:** Testing the inputs directly isolates the decision. A separate event with a stored preference checks whether the worker applies that decision correctly.

5. Stop rollout if the same event ID sends two emails to the same enabled member.

   **Why:** Delivery to the worker can repeat without a new shipment, so the customer would receive false extra notifications.

6. Enable shipment email for a member with empty test inboxes, process the event once and record counts and IDs, replay the same ID and wait for the job to finish, then compare both channels against the baseline.

   **Why:** The baseline ties any new message to the replay rather than prior activity. Job completion tells you when absence of a duplicate is meaningful.

## Why the tempting answer fails

Preview length does not tell you when preferences apply. Email layout is useful after the opt-out rule is covered. The UI cannot directly observe both worker outputs, and an API check adds dependencies that do not belong in the pure channel decision.

## What the interviewer listens for

Explain how you identify a repeat and how you know the worker has finished.

## Sources

- [ISTQB CTFL syllabus v4.0.1, test levels (2.2.1) and risk-based testing (5.2)](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
