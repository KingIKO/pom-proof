---
title: "Two bugs need attention before release, but you can fix only one. How do you choose?"
topic: bug-reports
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: "I compare who each bug affects, what harm it causes, and whether customers can work around it. I record when it's safe to wait."
looksFor:
  - "Compare the harm of shipping each bug."
  - "Say which counts of affected users you measured and which you estimated."
  - "Try the workaround as an affected user."
  - "Record what to fix, who makes the release decision, and why the other bug can wait."
trap: "Ranking by ticket age or customer count alone without checking who is blocked or could face lasting harm."
followUps:
  - question: "What if the workaround needs an administrator and many customers can't reach one?"
    answer: "I wouldn't count it as a workaround for those customers. I'd review the order of fixes again with the release owner."
  - question: "What if the team says the fix for the worse bug is too risky to ship now?"
    answer: "I'd discuss turning off the affected change or delaying release. I'd record the risk of the fix and the harm to customers together and ask the release owner to decide."
---

I'd tell the team which customers can hit each bug and what happens to them. I'd also say whether those customers have a workaround that works. I'd ask engineering how much each fix would change. I'd show the release owner where we still lack evidence.

If we postpone one fix, I'd record the workaround and name the person responsible for following up. I'd also note what would make us change the decision.

### Example

Suppose I get two reports before a booking release. People using a screen reader, which reads the screen aloud, can't select a time in the new picker. The booking history also opens in the wrong sort order for everyone. I'd check both paths and look for another way to select a time.

If there isn't one, I'd recommend fixing the picker or keeping the old one. Since customers can change the sort order themselves, I'd set the history bug aside. I'd put the tested workaround in the support note.
