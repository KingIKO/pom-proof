---
title: How did you help a team that mostly tested by hand start running tests automatically?
topic: leadership
roles: [senior, sdet, automation]
level: senior
type: behavioral
oneLine: I start with a repeated check the team finds painful. I build the team's ownership of the tests along with the test code.
looksFor:
  - Name a workflow the team chose to automate and the reason for it.
  - Explain how you helped manual testers shape the checks and own them.
  - Give a measured improvement and describe the support that continued after it.
  - Say what you chose on purpose to leave for exploration by hand.
trap: Handing a large test suite to a team that cannot run or repair it.
followUps:
  - question: What if the team is nervous about writing code?
    answer: I'd pair on a real case. I'd let people start with test design and diagnosing failures. Then I'd build their skill at writing tests from a spec they already understand.
---

Four testers spent about 45 minutes each checking the same account workflows every release. I asked them which steps repeated exactly and which needed judgment. We picked sign-in and account recovery for a small first batch.

I paired with each tester, which means we worked on the task together. Each pair either wrote a test case or diagnosed a failure that was caused on purpose. We also took turns looking at the next failing run.

After a month, the automated checks took seven minutes. Two teammates had fixed checks on their own. We kept a manual review of the recovery messages. It checked whether they made sense to someone seeing them for the first time.

I learned to plan time for pairing and repairs from the start, because the new test suite still needed owners.

### Example

The first recovery case proved that a synthetic reset link, one made only for testing, could be used once. A tester who designed the manual case selected the expired-link follow-up for automation.
