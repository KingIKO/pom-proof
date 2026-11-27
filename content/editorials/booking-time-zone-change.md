---
problem: scenario/booking-time-zone-change
---

## What is going on

The venue's zone owns the appointment. At a spring clock change, a local time can correspond to no instant; in autumn, the same hour can occur twice. A printed hour or a `datetime-local` field carries no time zone on its own.

## The answer

1. Ask which zone a remote user sees on confirmation and how the missing and repeated times appear in the list.

   **Why:** The same visible hour could refer to two appointments, so the labels have to tell a customer which one they are choosing.

2. Spend five minutes checking that the spring gap has no selectable appointment. Spend eight comparing the two autumn entries and booking the second through confirmation.

   **Why:** The gap test catches an impossible appointment. The autumn test catches two real slots being treated as one, even if both appear in the list.

3. Unit-test the pure conversion helper: expect no instants for the gap and two for the overlap.

   **Why:** This isolates the time mapping from bugs in rendering or booking that could mask its result.

4. Use a UI booking test to distinguish the autumn slots and confirm that the second selection keeps its instant.

   **Why:** Even a correctly stored instant does not prove a customer could tell the displayed slots apart.

5. Stop release if booking the second occurrence confirms the first.

   **Why:** Matching hour labels can hide the fact that the customer now has an appointment at the wrong instant.

6. Load the fixture with both autumn slots, record the expected second instant from its zone data, book the labeled second occurrence, then compare the saved confirmation with that expectation.

   **Why:** Recording the answer before booking keeps the same conversion bug from setting both sides of the comparison.

## Why the tempting answer fails

The launch email's city cannot settle the slot notation. An ordinary afternoon can book correctly while the repeated slot fails. A UI check adds noise to the pure gap calculation, and an API check cannot show which displayed slot customers select. Booking before recording the expected instant makes it easier to let the confirmation shape the expectation.

## What the interviewer listens for

Show where your independent expected instant comes from and how you carry that identity from selection to confirmation.

## Sources

- [MDN's datetime-local guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local)
