---
title: What do you do when you find a possible bug but the expected behavior is unclear?
topic: bug-reports
roles: [manual-qa, automation]
level: junior
type: scenario
oneLine: Record what happened and who it affects, then ask the owner to clarify the rule before you decide whether the behavior is defective.
looksFor:
  - Describe the actual behavior and where the expectation came from.
  - Point out conflicting evidence or a missing requirement.
  - Ask a specific question the owner can answer and record the decision.
  - Explain how the decision changes the ticket and the next test.
trap: Assuming your preferred behavior is the requirement, or dropping the finding because the requirement is incomplete.
followUps:
  - question: What if the owner confirms the behavior is intentional?
    answer: I'd record the decision. If the screen still promises something different, I'd raise that mismatch separately with the wording the user sees.
---

I write down what happened while I can still reproduce it. Then I check the requirement and what the screen tells the customer. If they disagree or leave a case open, I'd say so in the report and ask whoever owns the rule a specific question. I'd also explain the impact so they can decide how quickly we need an answer.

### Example

A booking says “Free cancellation until 6:00 p.m.” At 6:00 exactly, the confirmation screen shows a $25 fee. The story doesn't say whether 6:00 is included or which time zone applies. I'd capture the booking's local time and the quoted fee before confirming, then ask product to define the cutoff. If 6:00 is included, I'd report the fee as a defect. If it's excluded, I'd ask for clearer copy and check just before and at the cutoff against the agreed rule.
