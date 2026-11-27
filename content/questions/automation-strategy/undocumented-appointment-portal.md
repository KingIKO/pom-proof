---
title: Two patients can see the last appointment. Which check would you make required before release?
topic: automation-strategy
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: Make the check for double booking repeatable with a slot the test owns, and keep a browser check for the patient's confirmation.
looksFor:
  - Explains the cost of giving two patients the same appointment.
  - Uses a slot that can be created and cleared without touching anyone else's calendar.
  - Separates the confirmed reservation from what the patient sees on screen.
  - Checks what the patient and administrator can each verify before treating it as a requirement.
trap: Using whatever happens to be the last slot on a shared calendar, then treating a red result as a double booking.
followUps:
  - question: The administrator can create a slot from the portal, but CI cannot clear it. Would you make the check required yet?
    answer: I'd keep it advisory until CI has a dedicated calendar or a supported way to undo the booking. A job that can leave its own slot occupied will fail for the wrong reason on the next run.
---

I'd make the reservation rule the first candidate for CI. Two confirmations for one appointment could mean someone turns up and can't be seen. With no documentation, I'd book a slot in the test environment and check what the administrator's calendar records. I'd note which behavior I observed and which parts, such as how long a held slot lasts, still need confirmation.

Before making the job required, I'd prove CI can reach the portal, sign in as both patients, and leave the calendar clean afterward. I'd have the run log the slot ID, each attempt's result, and which patient the calendar recorded. For the browser check I'd target named controls on the confirmation screen. Once those results are dependable, I'd add cases for other ways a patient could lose an appointment.

### Example

I'd start with booking a seeded appointment and confirming a second patient cannot reserve the same time. I'd cover the conflict rule below the UI and keep a browser check for the confirmation the first patient sees.
