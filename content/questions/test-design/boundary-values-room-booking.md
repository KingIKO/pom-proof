---
title: How would you use boundary value analysis to test a study room's capacity limits?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Confirm the allowed range and smallest step, then test each edge with its nearest value across the boundary.
looksFor:
  - Confirms the unit and whether the endpoints count.
  - Picks neighboring values on both sides of each cutoff.
  - States which values should create a booking and which should be rejected.
  - Keeps the other booking details valid so the result can be traced to party size.
trap: Checking the two allowed endpoints and a typical value, leaving no test just outside either end.
followUps:
  - question: How would you expand that to three-value boundary coverage?
    answer: Include both neighbors of every partition boundary. For a whole-number range of 4 to 12, that adds 2, 5, 11, and 14 to the four two-value cases around those cutoffs.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask whether the limit includes both ends and whether party size is a whole number. That tells me which values are neighbors. For two-value boundary analysis, I want the closest accepted and rejected value at each cutoff. I'd keep the room, availability, and account valid and use independent bookings so one accepted case doesn't take the slot away from the next.

I'd check the result of submitting the booking. A helpful validation message matters, but so does making sure a rejected size never creates a reservation.

### Example

A library lets groups of 4 through 12 reserve its larger study room. With an available slot for each check, I'd submit 3 and 13 and expect no booking. I'd submit 4 and 12 and expect both bookings to show the exact party size in the confirmation.
