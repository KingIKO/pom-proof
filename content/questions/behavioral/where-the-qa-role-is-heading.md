---
title: The returns release pass dropped from four hours to 90 minutes. What did you test with the time you got back?
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: Use the time saved to investigate refunds that succeeded without a confirmation.
looksFor:
  - Explains why a lost refund confirmation was worth investigating.
  - Connects the time saved to a check the team would otherwise have missed.
  - Measures AI-drafted assertions against a known wrong refund amount.
  - Names the next failure the candidate is learning to simulate.
trap: Counting the drafts accepted without checking whether they detect a wrong refund amount.
followUps:
  - question: The draft checks the refund status but still passes with the wrong amount. What would you change?
    answer: I'd assert the amount on the refund record, then rerun against the same wrong amount to make sure the check fails.
sources:
  - label: ISTQB CTFL v4.0.1, section 6.2, benefits and risks of automation
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: GitHub, limitations of AI-generated code suggestions
    url: https://docs.github.com/en/copilot/responsible-use/inline-suggestions
---

Support wanted to know what to tell a shopper whose refund went through without a confirmation.
I was still spending four hours every release repeating stable checks. I paired with a developer
to move those into the pipeline, which left a 90-minute release pass. Before the next returns
change, I worked through that support case and added a check for the missing confirmation.

That's where I see more of my QA work going. I can have a tool draft a test, but I still decide
which outcome matters and prove the test detects a wrong one. Right now I'm learning to simulate
a payment timeout so I can test what the shopper and support see when the result is uncertain.

### Example

In one trial I reviewed six drafts. Two passed after I deliberately supplied the wrong
refund amount, so I rewrote their assertions before using them in the release suite.
