---
title: Tell me about a product decision you disagreed with.
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: Explain the user cost, propose an option that respects the product goal, and show how the decision was evaluated.
looksFor:
  - A fair account of the product goal
  - Your specific evidence and alternative
  - A measurable outcome or agreed decision rule
  - What you learned about choosing the right evidence
trap: Recounting how you won the argument without saying what improved for users.
followUps:
  - question: What if product chose its original plan?
    answer: I'd record the risk and ask what observation would justify changing course after release.
---

Product wanted to clear the whole application form on a failed submit so people couldn't retry a stale draft. I understood the concern, but in exploratory testing I saw that a temporary error could erase about six minutes of work. I brought a short recording and proposed preserving editable fields for temporary failures while requiring a fresh start when the draft really expired.

I helped define the two failure cases and tested both in the candidate build. In four timed practice runs after the change, recovery from the temporary failure took under 30 seconds instead of filling the form again. I learned that a small timed example can help a team choose between two reasonable behaviors.

### Example

For a service timeout the form retained the shipping fields. For a genuinely expired draft it explained why the customer needed to start again.
