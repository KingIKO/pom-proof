---
title: "An AI assistant drafts gym membership freeze tests from a support ticket. What would you share instead?"
topic: ai-testing
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd share the written freeze rule and use fictional members. I'd work out the expected results myself."
looksFor:
  - "Keep credentials and real customer details out of the information the assistant can see."
  - "Share the rule and an approved example that follows the team's test conventions."
  - "Check whether a proposed case follows the policy before treating it as correct."
  - "Review the expected results and run generated tests before keeping them."
trap: "Pasting a real member's support conversation into an assistant to save time setting up test data."
followUps:
  - question: "What if the assistant suggests a result that disagrees with the policy?"
    answer: "I'd follow the written policy. If it doesn't cover the case, I'd ask the owner what should happen before setting the expected result."
sources:
  - label: GitHub Copilot, writing tests with project context (accessed 2026-11-27)
    url: https://docs.github.com/en/copilot/tutorials/write-tests
  - label: GitHub Copilot, accuracy, review, and sensitive information (accessed 2026-11-27)
    url: https://docs.github.com/en/copilot/responsible-use/inline-suggestions
  - label: NIST AI RMF Playbook, third-party AI use and governance (accessed 2026-11-27)
    url: https://airc.nist.gov/airmf-resources/playbook/govern/
---

I'd replace the support ticket with the written rule and a fictional member whose dates let us check it. I don't need the customer's messages or credentials. I'd check which files the approved assistant can read. Then I'd share one permitted example of a fixture, the data and setup a test uses.

I'd ask for boundary cases, the cases just below, at, and above the policy limit. I could also ask for a draft test. I'd check each suggested result against the rule and run the tests before keeping them. If the rule doesn't tell me what should happen, I'd ask its owner before I accept the assistant's answer.

### Example

The gym allows a freeze of at most 30 days. I'd ask for test cases with fictional member records. I'd expect the gym's system to accept a 29-day or 30-day request. I'd expect it to reject a 31-day request and leave the membership unchanged.
