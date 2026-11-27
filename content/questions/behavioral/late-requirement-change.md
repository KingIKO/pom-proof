---
title: "Tell me about a requirement that changed just before release. What did you do?"
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: "I confirm the new rule and find the checks it affects. I tell the release owner what I can test in the time left."
looksFor:
  - "Explain how you clarified the new rule."
  - "Name the cases you reviewed because of the change."
  - "Show what you covered and what you found in the time available."
  - "Explain what the experience taught you to ask sooner."
trap: "Trying to rerun everything without saying which important checks you haven't run."
followUps:
  - question: "How did you document the cases you didn't get to test?"
    answer: "I listed those cases in the release note. For each one, I wrote down who would test it and when."
---

The day before a booking release, the product team changed the cancellation cutoff from 24 hours to 48 hours. I asked if customers could cancel exactly 48 hours before the booking. I also asked which time zone defined the appointment time. I recorded the answers in the issue before changing what the tests expected.

I found six cases affected by the change. I ran the ones most likely to expose a costly mistake first. I checked bookings just before, at, and just after the cutoff. I also looked for the old wording. I found it on one page and checked that the fix worked before release.

### Example

For a 3 p.m. Friday appointment, I tried to cancel at 2:59, 3:00, and 3:01 p.m. Wednesday. I used the same agreed reference time for each check. I learned to ask for exact cutoff examples as soon as someone proposes a policy change.
