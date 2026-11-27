---
title: How have you built a test strategy for a new product?
topic: leadership
roles: [senior, sdet]
level: senior
type: behavioral
oneLine: Link coverage and launch decisions to the ways real customers could be harmed.
looksFor:
  - Your role in identifying expensive or irreversible failures
  - Deliberate choices about test layers and environments
  - Evidence that changed the launch plan
  - A result and a lesson you reused
trap: Presenting a list of test types without tying any of them to a launch decision.
followUps:
  - question: What do you cut if the timeline is halved?
    answer: I'd protect coverage for irreversible actions, permissions, and recovery, then make the lower-risk gaps explicit to the release owner.
  - question: How would operations know whether the booking pilot should expand?
    answer: >-
      Give operations a named owner and a way to see when cancelled slots stay held. Before the
      pilot I'd make the rollback rehearsal a release requirement, run it with synthetic appointments
      in staging, and check that recovery still works at the expected booking volume.
---

I led QA for a new clinic booking portal with six weeks to launch. I interviewed support and product to learn which failures were hardest to recover from. Double bookings and confirmations sent to the wrong person topped the list. I put overlap rules in service tests and used a few browser flows for booking and cancellation. I asked operations to rehearse a rollback with synthetic appointments.

The rehearsal found that cancelling a booking didn't restore the slot. I made that a launch requirement and checked the fix before the pilot. Over two pilot weeks, staff reconciled 240 appointments without finding a duplicate. The pilot was small, so we kept monitoring overlap. I learned to include recovery in the strategy from the first draft.

### Example

I asked two testers to claim one synthetic appointment slot. We checked that exactly one reservation and one confirmation existed.
