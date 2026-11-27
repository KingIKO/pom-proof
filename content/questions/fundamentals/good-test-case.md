---
title: "What would you write so someone else can run your test and judge the result?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I write down why we run the test, how to set it up, and what inputs to use. I describe a result the tester can check."
looksFor:
  - "Name the behavior or risk the test covers."
  - "Say which account role, data, or starting conditions the tester needs."
  - "Include the steps that matter to the result."
  - "Describe what someone can see that tells them the test passed."
trap: "Writing 'check that it's correct' without naming the expected value or behavior."
followUps:
  - question: "When would you write down every click?"
    answer: "I'd do that only if the sequence matters to the bug or helps someone repeat the test. Otherwise, I'd name the key step and what needs to be true before it."
  - question: "If both wallets show the ticket after the recipient accepts it, how would you decide whether the test passes?"
    answer: >-
      I'd record which ticket and accounts to use. I'd check that the recipient can enter and that the system rejects the sender's copy.
      If the old ticket shows as transferred, that may be fine. I'd state whether the rule also says who can see the ticket.
sources:
  - label: "ISTQB glossary, test case"
    url: https://glossary.istqb.org/en_US/term/test-case
---

I write a test case as a set of steps and results someone else can check. I say why the test matters and which account to use so someone can repeat it without asking me. I describe what needs to be true at the start and list any inputs where the exact value matters.

In the expected result, I say what the tester will see or what should change in the system. If several unrelated problems could fail one case, I'll probably split it into separate cases.

### Example

To test a ticket transfer, I'd give the sender a paid ticket and make sure the recipient has an active account. After the recipient accepts, I'd look for the ticket in their wallet. I'd also check that the sender can no longer use their copy. If I wrote only "see success," the tester wouldn't know to check the sender's copy.
