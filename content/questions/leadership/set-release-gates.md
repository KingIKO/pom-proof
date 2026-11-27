---
title: Tell me about a quality gate you added to CI and how you chose what it blocked.
topic: leadership
roles: [senior, sdet, automation]
level: senior
type: behavioral
oneLine: Make reliable signals for costly failures required and give exceptions an owner and an expiry.
looksFor:
  - Your decision about which risks should block merges
  - Runtime and first-attempt reliability measured before making checks required
  - A recovery or exception path with ownership
  - A measured result and a lesson about keeping trust
trap: Requiring every available check on day one and normalizing bypasses once the gate gets noisy.
followUps:
  - question: Who can approve an exception?
    answer: I'd agree on a named release decision owner and require a record of the risk, temporary coverage, and the date the exception ends.
  - question: What would make you move a check from a nightly run to a required check?
    answer: >-
      I'd ask what bad merge it can stop, how often the result points to a real issue, and how long a
      developer has to wait. A short sign-in check can earn that place; I'd keep the full browser
      matrix scheduled if its feedback arrives too late to help. Mandatory checks still run as required.
---

Our merges depended on a verbal release check, so a broken sign-in reached staging twice in a month. I piloted six smoke checks without blocking merges for two weeks. I tracked time to a result and whether a failure reliably meant someone needed to act. Once the checks were dependable, I proposed making them required and leaving the slower browser matrix on a separate schedule.

The new gate took a median of five minutes and caught two sign-in regressions before merge in the next eight weeks. I published who owned a failed check and who could approve an exception. I learned to demonstrate reliability first, so people could trust the gate when it turned red.

### Example

A change that redirected signed-in users back to the sign-in page failed the smoke. The larger export matrix kept running on its schedule.
