---
title: "What makes a test case easy for someone else to run?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "State the purpose, setup, input, and observable result so another tester knows exactly what would count as a failure."
looksFor:
  - "Identifies the behavior or risk being tested."
  - "Names required role, data, or prior state."
  - "Keeps the steps focused on meaningful actions."
  - "Gives a pass condition someone can observe."
trap: "Writing 'verify the results are correct' with no expected value or behavior."
followUps:
  - question: "Would you include every click?"
    answer: "Only if the click sequence matters to the bug or makes the test repeatable. Otherwise I'd name the meaningful action and the state it needs."
  - question: Both wallets display the ticket after acceptance. What would make that run pass or fail?
    answer: >-
      I'd write down which ticket and accounts to use, then check whether the recipient can enter
      and the sender's copy is rejected. An old ticket still shown as transferred may be fine;
      the case needs to say whether visibility itself is part of the rule.
sources:
  - label: "ISTQB glossary, test case"
    url: https://glossary.istqb.org/en_US/term/test-case
---

I write a case so another person knows why they're running it and can get the same answer without asking me which account I used. I include the starting state and any exact values that make a difference. Expected results should say what the tester sees or what changes in the system. If there are several unrelated reasons the case could fail, I'll probably split it.

### Example

For a ticket transfer, I'd start with a paid ticket owned by the sender and an active recipient account. After the recipient accepts, the ticket should appear in the recipient's wallet and stop being usable in the sender's wallet. “See success” alone wouldn't tell the tester to check the old owner's copy.
