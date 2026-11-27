---
title: "What do you do if you find a possible bug but the rule is unclear?"
topic: bug-reports
roles: [manual-qa, automation]
level: junior
type: scenario
oneLine: "I record what happened and who it affects. I ask who owns the rule to clarify it before I call the behavior a bug."
looksFor:
  - "Describe what happened and where you got the expected result."
  - "Point out any evidence that disagrees or any rule that's missing."
  - "Ask the owner a specific question and write down the answer."
  - "Explain how the answer changes the ticket and what you'll test next."
trap: "Assuming the rule works the way you'd prefer or dropping the finding because the rule is unclear."
followUps:
  - question: "What if the owner says the behavior is intentional?"
    answer: "I'd record the decision. If the screen promises something different, I'd file that as a separate issue and quote what the customer sees."
---

I write down what happened while I can still repeat it. I compare the requirement with what the screen tells the customer. If the two disagree or leave a case unanswered, I say so in the report. I ask the person who owns the rule a specific question. I give them the impact so they can decide how quickly we need an answer.

### Example

I see “Free cancellation until 6:00 p.m.” on a booking. At 6:00 exactly, the confirmation screen shows me a $25 fee. The feature ticket doesn't say whether 6:00 is included or which time zone applies. Before confirming, I'd save the booking's local time and the fee on the screen.

I'd ask the product team to define the cutoff. If 6:00 is included, I'd report the fee as a bug. If it's excluded, I'd ask for clearer wording. I'd also test just before and at the cutoff against the agreed rule.
