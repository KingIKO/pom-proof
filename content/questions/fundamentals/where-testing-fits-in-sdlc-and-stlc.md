---
title: The hotel's cancellation ticket says "free until midnight." What should be attached before the change ships?
topic: fundamentals
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: Keep the midnight decision, the tested booking setup, and the resulting balances together on the ticket.
looksFor:
  - Records whose midnight the rule uses and which risks that creates.
  - Names what evidence is needed for release and how to produce it.
  - Plans the booking setup while the feature is being built.
  - Keeps results and open gaps with the rule for the next change.
trap: Putting the entire testing life cycle between the last code change and the release.
followUps:
  - question: The hotel changes its cutoff after launch. Which part of the ticket would you reuse?
    answer: I'd use the reservation and clock setup again, update the expected balances for the new boundary, and check whether the old rule still applies to existing bookings.
sources:
  - label: ISTQB CTFL v4.0.1, sections 1.4 and 2.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd want the ticket to show which midnight we agreed on and what balance we saw after
cancellation. The balance is release evidence. To make it repeatable, I'd record the test build,
reservation and clock setting, along with any defect or untested case the release owner needs to see.

That record starts during requirements review, where I'd flag the time-zone risk and agree how
much evidence we need. As the design takes shape, I'd write the cutoff cases and get a verified
environment ready while development continues. Those are parts of the testing life cycle within
the broader software development life cycle. In a short iteration they can overlap. At closure
I'd keep the results with the rule so the next change can use them.

### Example

For free hotel cancellation, I'd settle which time zone sets the cutoff, prepare an account with a
reservation, then record whether cancelling on either side of the cutoff leaves the correct balance.
