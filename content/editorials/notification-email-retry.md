---
problem: scenario/notification-email-retry
---

Ask what defines the same event and at which point the worker evaluates email preferences. Two shipments for the same order might carry different event IDs. And a change in preferences while a job is queued needs its own expectation before a tester can call the result wrong.

Spend seven minutes on replay and five on an opt-out. Start with empty test inboxes and an enabled member. Process one event, capture both baselines, replay that event, and compare the final IDs and counts after the second job finishes. Without the baseline, two messages in a test mailbox could predate the run. Waiting for worker completion gives the absence check a concrete end point.

Use the event API and read both outcomes independently. Seeing one item in the app gives no evidence about the mailbox. For opt-out, start with a unit table for the pure channel decision, then use a stored preference and a fresh event to check how the worker applies it. The decoy's email rendering check has value after coverage of the opt-out rule. A duplicate email for the same event stops rollout under this contract.

An interviewer wants to hear how you identify a repeat and how you know the worker has finished. See [ISTQB CTFL, test levels and risk-based testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
