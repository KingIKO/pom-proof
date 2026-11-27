---
title: How have you built a test strategy for a new product?
topic: leadership
roles: [senior, sdet]
level: senior
type: behavioral
oneLine: I tie test coverage and launch decisions to the ways real customers could be harmed.
looksFor:
  - Explain your part in finding failures that are costly or cannot be undone.
  - Show deliberate choices about test layers and test environments.
  - Give evidence that changed the launch plan.
  - Share a result and a lesson you used again.
trap: Listing test types without showing what any of the tests would tell you about whether to launch.
followUps:
  - question: If you have half as much time to test, which checks would you drop?
    answer: I'd protect coverage for actions that cannot be undone, for permissions, and for recovery. Then I'd make the lower-risk gaps clear to the release owner.
  - question: What would help the operations team decide whether to expand the booking trial?
    answer: >-
      I'd give operations a named owner and a way to see when cancelled slots stay held. Before the
      pilot, I'd make the rollback rehearsal a release requirement. I'd run it with synthetic
      appointments in staging. I'd also check that recovery still works at the expected booking volume.
---

I led QA for a new clinic booking portal with six weeks to launch. I used a test strategy to decide what to test and how. I interviewed support and product to learn which failures were hardest to recover from. Double bookings and confirmations sent to the wrong person were at the top of the list.

I put the rules for overlapping appointments in service tests. Those tests check the booking service directly, without a browser. I used a few browser tests for booking and cancellation. I asked operations to rehearse a rollback, which means undoing a release. They used synthetic appointments, fake bookings made only for testing.

The rehearsal found that cancelling a booking didn't restore the slot. I made that a launch requirement and checked the fix before the pilot. Over two pilot weeks, staff reconciled 240 appointments without finding a duplicate. The pilot was small, so we kept monitoring overlap. I learned to include recovery in the strategy from the first draft.

### Example

I asked two testers to claim one synthetic appointment slot. We checked that exactly one reservation and one confirmation existed.
