---
problem: scenario/booking-time-zone-change
---

The venue zone owns the appointment. Ask which zone a remote user sees on confirmation and how the repeated local times are distinguished in the list. A printed hour alone cannot prove which occurrence the app booked.

Spend five minutes on the gap and eight on the repeat. The first case checks that an impossible local appointment cannot be offered. The second follows the customer's selection across the boundary where the two slots could be collapsed into one. Load the fixture, record the expected instant from its zone data, then select and book the second occurrence. Compare the saved confirmation with that expectation. Deriving the expected time from the confirmation would let the same bug set both sides of the comparison.

Start with a unit table for the pure helper: the gap yields no instants and the overlap yields two. Keep a UI booking check for identity across the full trip. An API check can prove the instant was stored, but it cannot show whether customers can tell the rendered slots apart. The decoy's ordinary afternoon can pass while the repeated slot is misbooked. That wrong instant blocks release.

The interviewer wants to hear how you prove the instant independently. See [MDN's datetime-local guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local) for what a local time field does and does not carry.
