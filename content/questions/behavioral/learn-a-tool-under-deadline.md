---
title: Tell me about a time you had to learn a new testing tool quickly.
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: Start from a real testing need, prove one useful case, and show that someone else could repeat it.
looksFor:
  - The immediate testing problem you owned
  - How you narrowed what you needed to learn
  - Independent use or another measurable result
  - What you would do differently next time
trap: Saying you completed tutorials without showing what changed for the team.
followUps:
  - question: How did you know your check could fail for the right reason?
    answer: I used a known invalid input and confirmed the result showed the difference I expected.
---

I had four days to cover an order endpoint while the browser screen was still being built. I hadn't used the team's API client before. I took one working request from the maintainer, reproduced it in the test environment, then changed one input at a time. I got a valid order and a rejected order without needing the UI.

I saved four checks with dummy inputs and wrote a short setup note. A teammate could run them in under ten minutes without my help. I learned that one real request and a known bad case taught me more than trying every feature in the tool.

### Example

For the rejected case I sent a quantity of zero. I checked the error named the quantity field and that no order had been created.
