---
title: How would you run a three amigos conversation for an appointment waitlist?
topic: agile
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: Use a concrete case to get the business rule agreed, then record the examples and unresolved decisions.
looksFor:
  - Bring product, development, and testing perspectives into the same conversation.
  - Compare examples that force a choice about who gets the open slot.
  - Record the agreed rule in a form the team can check.
  - Give unresolved questions an owner before the team builds on an assumption.
trap: Using the meeting to approve a ticket without settling how the waitlist behaves when an offer expires.
followUps:
  - question: What if product cannot decide what happens when an offer expires?
    answer: Record it as an open policy decision with an owner. If it changes who can book the slot, keep that behavior out of the work the team starts until the owner decides.
  - question: Can someone from support join?
    answer: Yes. I'd invite support if they're the ones handling missed offers and can explain what customers already expect.
sources:
  - label: Cucumber docs on the three amigos
    url: https://cucumber.io/docs/bdd/who-does-what/#the-three-amigos
  - label: Scrum Guide on Scrum events
    url: https://scrumguides.org/scrum-guide.html#scrum-events
---

I'd start with two customers waiting for the same appointment and one slot becoming free. I want someone to speak for the business rule, someone to explain what the system can guarantee, and someone to ask what breaks. Three amigos is one way to get those perspectives together before building. It isn't a required Scrum event.

I'd ask who should get the offer and when the next person gets a turn. Once we agree, I'd put a concrete example on the story. If we still disagree about a rule, I'd write down who's getting the answer instead of picking one quietly.

### Example

Product chose to offer the slot to the first eligible person for 15 minutes. I asked what should happen if that person opened the link after it expired. We added an expired-link example, and the developer used it to check that the old link couldn't take the slot back from the next customer.
