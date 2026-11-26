---
title: How did you introduce automation to a team that was mostly testing manually?
topic: leadership
roles: [senior, sdet, automation]
level: senior
type: behavioral
oneLine: Start with a painful repeated check and build ownership alongside the test code.
looksFor:
  - A workflow the team chose to automate for a reason
  - How you helped manual testers shape and own the checks
  - A measured improvement with ongoing support
  - What you deliberately left to exploration
trap: Dropping a large suite on a team that cannot run or repair it.
followUps:
  - question: What if the team is wary of coding?
    answer: I'd pair on a real case, let people start with test design and diagnosis, and build authoring skills from a spec they already understand.
---

Four testers spent about 45 minutes each checking the same account workflows every release. I asked them which steps repeated exactly and which needed judgment. We picked sign-in and account recovery for a small first batch. I paired with each tester on writing a case or diagnosing a deliberate failure, and we rotated who looked at the next failing run.

After a month, the automated checks took seven minutes and two teammates had fixed checks independently. We kept manual review for whether recovery messages made sense to someone seeing them for the first time. I learned to budget pairing and repair time up front, because the new suite still needed owners.

### Example

The first recovery case proved a synthetic reset link could be used once. A tester who designed the manual case selected the expired-link follow-up for automation.
