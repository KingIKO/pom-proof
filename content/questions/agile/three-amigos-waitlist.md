---
title: "How would you use a three amigos meeting to settle an appointment waitlist rule?"
topic: agile
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: "I'd bring an example to help the team agree on the rule. I'd record what we decide and what still needs an answer."
looksFor:
  - "Bring people who can speak for product, development, and testing into the meeting."
  - "Compare examples that make the team decide who gets the free slot."
  - "Record the rule with an example the team can check."
  - "Name who will answer any open question before the team builds around a guess."
trap: "Approving the ticket without deciding what happens when a waitlist offer expires."
followUps:
  - question: "What if the product team can't decide what to do when an offer expires?"
    answer: "I'd record the open rule and name who will decide. If the answer changes who can book, I'd keep that part out of the work we start until they decide."
  - question: "When would you invite someone from support?"
    answer: "I'd invite support if they handle missed offers and can explain what customers already expect."
sources:
  - label: Cucumber docs on the three amigos
    url: https://cucumber.io/docs/bdd/who-does-what/#the-three-amigos
  - label: Scrum Guide on Scrum events
    url: https://scrumguides.org/scrum-guide.html#scrum-events
---

I'd start with two customers waiting for the same appointment and one slot opening up. In a three amigos meeting, I'd ask product to explain the business rule. I'd ask development what the system can guarantee. I'd ask testing what might go wrong. Scrum doesn't require this meeting.

I'd ask who gets the offer and when the next person gets a turn. Once we agree, I'd add a specific example to the work item. If we still disagree, I'd name who will get the answer before anyone builds around a guess.

### Example

The product team chose to offer the slot to the first eligible person for 15 minutes. I asked what should happen if that person opens the link after it expires. We added an example for that case. The developer checked that the old link couldn't take the slot back from the next customer.
