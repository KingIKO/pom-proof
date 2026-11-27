---
title: The hotel says cancellation is free until midnight. What would you add to the ticket before release?
topic: fundamentals
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: I'd record which midnight the rule uses on the ticket. I'd include how I set up the booking for the test and the balances I saw.
looksFor:
  - Write down which time zone the rule uses and what can go wrong.
  - Say what evidence the release needs and how you'll get it.
  - Plan how to set up the test booking while the team builds the feature.
  - Keep the results and any gaps with the rule for the next change.
trap: Waiting until the last code change to start planning and running tests.
followUps:
  - question: If the hotel changes its cutoff after launch, what could you reuse from the ticket?
    answer: I'd reuse the reservation and clock settings. I'd update the balances I expect at the new cutoff. I'd check whether the old rule still applies to existing bookings.
sources:
  - label: ISTQB CTFL v4.0.1, sections 1.4 and 2.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd record which midnight we agreed on and the balance I saw after cancelling. The balance helps the release owner decide whether the change is ready. So someone can repeat the test, I'd note the app version, reservation, and clock setting. I'd also record any bugs or untested cases the release owner needs to see.

I'd start that record during the requirements review. I'd raise the time zone risk and agree on how much evidence we need. While the team designs the feature, I'd write tests for the cutoff. While development continues, I'd set up a place to run the tests and check that it works.

These steps are part of my testing life cycle, the work from planning tests through recording results. I do that work within the software development life cycle, which covers building and releasing the feature. In a short work cycle, testing and development steps can overlap. I'd keep the final results with the rule so the next change can use them.

### Example

For free hotel cancellation, I'd agree which time zone sets the cutoff. I'd prepare an account with a reservation. I'd cancel on each side of the cutoff and record whether the account has the right balance each time.
