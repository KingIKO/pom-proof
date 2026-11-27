---
title: Tell me about a quality gate you added to CI and how you chose what it blocked.
topic: leadership
roles: [senior, sdet, automation]
level: senior
type: behavioral
oneLine: I make reliable checks for costly failures required. I give each exception an owner and an end date.
looksFor:
  - Explain how you decided which risks should block merges.
  - Before making checks required, measure their run time and how reliable they are on the first attempt.
  - Describe a way to recover or approve an exception, with a named owner.
  - Give a measured result and a lesson about keeping people's trust in the gate.
trap: Requiring every available check on day one. Then letting bypasses become normal once the gate starts raising false alarms.
followUps:
  - question: Who can decide to let a change through despite a required check?
    answer: I'd agree on a named owner for release decisions. I'd require a record of the risk, the temporary coverage, and the date the exception ends.
  - question: What would make you move a check from a nightly run to a required check?
    answer: >-
      I'd ask what bad merge it can stop, how often its result points to a real issue, and how long a
      developer has to wait. A short sign-in check can earn that place. If the full browser matrix gives
      feedback too late to help, I'd keep it scheduled. Mandatory checks still run as required.
---

Our merges depended on a verbal release check. As a result, a broken sign-in reached staging twice in a month. Staging is the environment where we test a build before release. I piloted six smoke checks for two weeks without letting them block merges. A smoke check is a quick test that a key feature still works.

I tracked the time to a result. I also tracked whether a failure reliably meant someone needed to act. Once the checks were dependable, I proposed making them a required quality gate. In CI, the system that tests each change, a quality gate is a set of checks that must pass before merge. The slower browser matrix, which runs tests across many browsers, would stay on a separate schedule.

The new gate took a median of five minutes. In the next eight weeks, it caught two sign-in regressions before merge. A regression is a bug in something that used to work. I published who owned a failed check and who could approve an exception. I learned to show reliability first, so people could trust the gate when it turned red.

### Example

A change redirected signed-in users back to the sign-in page, and it failed the smoke checks. The larger export matrix kept running on its schedule.
