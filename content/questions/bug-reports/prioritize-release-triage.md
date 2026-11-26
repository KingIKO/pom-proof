---
title: How would you triage two defects when there's time to fix only one before release?
topic: bug-reports
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: Compare user impact, reach, and workarounds, then document which issue to fix and what would make the other safe to defer.
looksFor:
  - Compare the cost of leaving each defect in the release.
  - Distinguish measured reach from an estimate.
  - Check that a proposed workaround actually works for affected users.
  - Record the fix recommendation, who owns the release decision, and the reason for deferral.
trap: Ranking by ticket age or customer volume alone, without checking whether anyone is blocked or faces lasting harm.
followUps:
  - question: What if the workaround requires an administrator and many customers don't have one available?
    answer: I'd stop counting it as a workable option for those customers and revisit the ranking with the release owner.
  - question: What if engineering says the higher-impact fix is too risky for this release?
    answer: I'd discuss disabling the affected change or delaying the release. I'd ask the release owner to decide with the fix risk and the customer impact recorded together.
---

I'd bring the team a short comparison: which customers can hit each issue, what happens to them, and whether they have a workable route around it. I'd ask engineering about the scope of each fix and tell the release owner where our evidence is thin. If we defer one, I'd record the workaround, who owns the follow-up, and what would cause us to reconsider.

### Example

Two reports come in before a booking release. Screen reader users can't select a slot in the new picker. The booking history also opens in the wrong sort order for everyone. I'd check both paths myself, including whether there is another way to select a slot. If there isn't, I'd recommend fixing the picker or keeping the old one. Since customers can set the sort order themselves, I'd defer the history issue and put the tested workaround in the support note.
