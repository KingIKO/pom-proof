---
title: An assistant drafts gym freeze tests from a support ticket. What would you give it instead?
topic: ai-testing
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Give the assistant the freeze rule and fictional accounts, then derive the expected results from the rule yourself.
looksFor:
  - Keeps credentials and real customer records out of the assistant's context.
  - Supplies the requirement and an approved example that reflects team conventions.
  - Distinguishes a useful test idea from evidence that the case is correct.
  - Reviews the expected results and runs any generated tests before adoption.
trap: Pasting a member's real support exchange into an assistant to save time on test data.
followUps:
  - question: What if the assistant's proposed case disagrees with the policy?
    answer: >-
      I'd use the policy as written. If the policy doesn't cover the case, I'd ask the owner for
      the intended behavior before writing an expected result.
sources:
  - label: GitHub Copilot, writing tests with project context (accessed 2026-11-27)
    url: https://docs.github.com/en/copilot/tutorials/write-tests
  - label: GitHub Copilot, accuracy, review, and sensitive information (accessed 2026-11-27)
    url: https://docs.github.com/en/copilot/responsible-use/inline-suggestions
  - label: NIST AI RMF Playbook, third-party AI use and governance (accessed 2026-11-27)
    url: https://airc.nist.gov/airmf-resources/playbook/govern/
---

I'd replace the ticket with the written rule and a fake member whose dates exercise it. I don't
need the customer's exchange or credentials to draft the test. I'd check which files the approved
assistant can see and share one permitted example of how our fixtures are written.

I'd ask it for boundary cases or a starter test, then compare the suggestions with outcomes I worked
out from the rule. I'd run the resulting checks before keeping them. When the written rule is
silent, I'd resolve that with its owner before accepting any generated expectation.

### Example

The gym allows a freeze of at most 30 days. I'd ask the assistant to draft cases and invent
member records. I'd expect a 29-day or 30-day request to be accepted and a 31-day request to
be rejected without changing the membership.
