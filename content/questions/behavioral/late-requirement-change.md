---
title: Tell me about a late requirement change and how you handled it.
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: Confirm the new rule, identify what it invalidates, and give the release owner a clear coverage tradeoff.
looksFor:
  - Your clarification of the changed expectation
  - A specific review of affected cases
  - A measurable result within the time available
  - What you learned to ask earlier
trap: Trying to rerun the whole suite without telling anyone which important tests are now unproven.
followUps:
  - question: How did you record what stayed untested?
    answer: I listed deferred cases with the release note and named who would cover them and when.
---

The day before a booking release, product changed the cancellation cutoff from 24 hours to 48 hours. I asked whether exactly 48 hours was allowed and which time zone defined the appointment time. I wrote those answers into the issue before changing any expected results.

I identified six affected cases and ran the highest-risk ones first: bookings just before, exactly at, and just after the cutoff. I also checked that the old wording was gone. I found one page that displayed the old policy and verified its fix before release. I learned to get exact boundary examples as soon as a policy change is proposed.

### Example

For a 3 p.m. Friday appointment I checked cancellation at 2:59, 3:00, and 3:01 p.m. Wednesday using the same agreed reference time.
