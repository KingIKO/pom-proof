---
title: "Two patients see the last appointment. What check would you require before a release?"
topic: automation-strategy
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "I'd use a slot the test owns to check that the system can't book it twice. I'd also check the patient's confirmation in the browser."
looksFor:
  - "Explain what happens if two patients think they booked the same slot."
  - "Set up and clear a slot without touching anyone else's calendar."
  - "Check the saved reservation separately from the patient's screen."
  - "Check what patients and administrators can each see before calling it a requirement."
trap: "Using the last slot on a shared calendar and assuming any test failure means a double booking."
followUps:
  - question: "The administrator can add a slot, but CI can't clear it. Would you require the check yet?"
    answer: "I'd make it report-only until CI gets a dedicated calendar or a supported way to undo the booking. If one run leaves the slot occupied, the next run will fail for the wrong reason."
---

I'd start with double booking as a candidate for continuous integration (CI), the service that runs tests on code changes. If two patients receive confirmations for one slot, one may arrive and find nobody can see them. If the rules aren't documented, I'd book a test slot and check the administrator's calendar. I'd record what I saw and ask about anything still unknown, such as how long a hold lasts.

Before requiring the check, I'd make sure CI can open the portal, sign in as both patients, and clean up the calendar. I'd log the slot ID, each attempt's result, and which patient the calendar recorded. I'd check for named controls on the confirmation screen. Once those results are dependable, I'd test other ways a patient could lose a booking.

### Example

I'd prepare one appointment and book it for the first patient. I'd test below the browser that the second patient can't book the same time. I'd keep a browser check for the confirmation the first patient sees.
