---
title: "Returns testing dropped from four hours to 90 minutes. What did you test with the time you saved?"
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: "I used the time to test refunds that went through without a confirmation."
looksFor:
  - "Explain why a missing refund confirmation mattered to shoppers and support."
  - "Show which check the team would have missed without the time it saved."
  - "Report how tests drafted by AI handled a known wrong refund amount."
  - "Name the next failure you're learning to produce on purpose."
trap: "Counting the drafts you kept without checking if they catch a wrong refund amount."
followUps:
  - question: "If a draft checks refund status but passes with the wrong amount, what would you change?"
    answer: "I'd add a check for the amount on the refund record. I'd run it again with the same wrong amount and make sure it fails."
sources:
  - label: ISTQB CTFL v4.0.1, section 6.2, benefits and risks of automation
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: GitHub, limitations of AI-generated code suggestions
    url: https://docs.github.com/en/copilot/responsible-use/inline-suggestions
---

Support wanted to know what to tell a shopper whose refund went through without a confirmation. I was still spending four hours per release repeating reliable checks. I worked with a developer to make those checks run automatically in the release pipeline, the steps that test and prepare a release. That left a 90-minute release check. I explored the support case and added a check for the missing confirmation before the next returns change.

I expect to spend more of my time as a tester on work like that. I can ask a tool to draft a test. I still decide what result matters and prove the test catches a wrong one. I'm learning to simulate a payment timeout so I can see what the shopper and support see when the payment result is uncertain.

### Example

I reviewed six drafts in one trial. Two passed when I supplied the wrong refund amount on purpose. I rewrote their assertions, the checks for expected results, before using them in the release tests.
