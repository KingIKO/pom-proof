---
title: "Tell me about a product decision you disagreed with."
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: "I explain the cost to users and offer an option that still meets the product goal. I show how we checked the result."
looksFor:
  - "Explain why the product team wanted its original plan."
  - "Share what you observed and what you proposed instead."
  - "Report a result you could measure or a rule the team agreed to use."
  - "Explain what you learned about picking evidence."
trap: "Telling the story as a win without saying what got better for users."
followUps:
  - question: "What would you do if the product team kept its original plan?"
    answer: "I'd record the risk. I'd ask what we'd need to see after release to change the plan."
---

If an application form failed to submit, the product team wanted to clear it. That would stop people from trying again with an old draft. I understood the concern. When I explored the form, I found that a temporary error could erase about six minutes of work. I brought a short recording and proposed keeping the customer's entries editable after a temporary error.

If the draft really had expired, I'd still make the customer start again. I helped define both cases and tested them in the build we planned to release. I ran four timed practice runs after the change. Recovering from the temporary error took under 30 seconds instead of filling out the whole form again. I learned that a short timed test can help a team choose between two reasonable options.

### Example

I made the service time out, and the form kept the shipping fields. When I tested a draft that had expired, the form explained why the customer had to start again.
