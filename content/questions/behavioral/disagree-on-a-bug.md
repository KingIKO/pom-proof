---
title: "Tell me about a time a developer didn't think you'd found a bug."
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: "I show how to repeat the problem and agree on what the customer should see."
looksFor:
  - "Describe how you replied calmly and explained the problem."
  - "Share evidence someone else can use to repeat the bug."
  - "State what the team agreed should happen."
  - "Explain the result and what you learned."
trap: "Treating the bug discussion as something to win and taking it to someone else before giving the developer evidence they can check."
followUps:
  - question: "What if the requirement doesn't say which behavior is right?"
    answer: "I'd write down both interpretations and explain how each affects the customer. I'd ask the product owner which one to test."
---

A developer closed my report about a booking calendar because their machine showed the right date. I wanted to find what differed between our setups. I sent the ID for a made-up reservation and compared our local time zones. The date changed when I switched to their time zone. I invited them to repeat both cases with me.

I asked the product team whether appointments should appear in the venue's time zone or the customer's. They chose the venue's time zone and added it to the acceptance criteria, the rules the feature must meet. I checked the fix in four time zones. I learned to include the setup in every bug report about dates.

### Example

I tested a reservation for July 12 at 12:30 a.m. in the venue's time zone. I saw July 11 in the affected view when I used a customer's different time zone.
