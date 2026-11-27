---
problem: scenario/booking-time-zone-change
---

## What is going on

Each appointment uses the venue's time zone. An instant is one exact point in time, the same everywhere in the world. At the spring clock change, a local time can match no instant at all. In autumn, the same local hour can occur twice. A printed hour or a `datetime-local` field, a browser date and time input, carries no time zone on its own.

## The answer

1. Ask how the product shows times at both selection and confirmation.

   Ask which zone the confirmation uses when the user's device is in a different zone. Ask how the list shows the missing and repeated times.

   **Why:** The same visible hour could refer to two appointments. The labels have to tell the customer which one they are choosing.

2. Spend five minutes on the spring gap, the hour skipped when clocks move forward, and eight minutes on the repeated autumn hour.

   Confirm that the gap has no selectable appointment. Compare the two autumn entries, then book the second one and follow it to confirmation.

   **Why:** The gap check catches an impossible appointment. The autumn booking catches two real slots treated as one, even if both appear in the list.

3. Unit-test the pure conversion helper, which turns a local time into instants.

   Expect no instants for the gap and two for the autumn overlap.

   **Why:** A unit test checks this helper on its own. The helper is pure, meaning its output depends only on its input. That separates the time mapping from rendering or booking bugs that could mask its result.

4. In a UI booking test, tell the two autumn slots apart and confirm that the second selection keeps its instant.

   **Why:** Even a correctly stored instant does not prove that a customer could tell the displayed slots apart.

5. If booking the second occurrence confirms the first, stop the release.

   **Why:** Both slots show the same hour label. That match can hide the fact that the customer now has an appointment at the wrong instant.

6. Check the saved confirmation for the second occurrence of the autumn slot.

   Load the fixture, the prepared test data, with both autumn slots. Record the expected instant of the second slot from the fixture's zone data. Book the slot labeled as the second occurrence. Then compare the saved confirmation with that expectation.

   **Why:** You record the expected instant before booking. So the same conversion bug cannot set both sides of the comparison.

## Why the tempting answer fails

The city in the launch email cannot settle how the slots are written. An ordinary afternoon can book correctly while the repeated slot fails. A UI check adds noise to the pure gap calculation. An API check cannot show which displayed slot customers select. If you book before recording the expected instant, it is easier to let the confirmation shape the expectation.

## What the interviewer listens for

Show where your expected instant comes from, independent of the service. Then show how you carry that slot's identity from selection to confirmation.

## Sources

- [MDN's datetime-local guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local)
