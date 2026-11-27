---
title: "What does shift-left testing look like before a feature is built?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: "Look for defects in examples and designs before code is ready, then keep checking the running feature as it comes together."
looksFor:
  - "Gets involved before implementation."
  - "Uses a concrete question to expose ambiguity."
  - "Turns the decision into a testable example."
  - "Keeps later execution in scope."
trap: "Saying shift-left means moving every UI test to the start of a sprint."
followUps:
  - question: "Can QA start before there is a test environment?"
    answer: "Yes. I can review the rule with product, write examples, and work with a developer on checks for the business logic."
  - question: The first Denver rollout is live. What result would make you hold back the next group?
    answer: >-
      I'd check cancellation outcomes around the warehouse cutoff in the canary group. If a request
      allowed by the rule is rejected, I'd use the flag to hold back the next group while we investigate.
      That gives us production feedback on the cutoff we agreed and checked earlier.
sources:
  - label: "ISTQB CTFL v4.0.1, sections 1.3 and 2.1.5"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
  - label: Google SRE, canarying releases
    url: https://sre.google/workbook/canarying-releases/
---

I ask to see the story when the team can still change the design. I bring a couple of examples that force a decision about timing, permissions, or a failure that the happy path skips. Once we agree on the answer, the developer can write a small check for the rule and I can prepare the data I'll need when the feature is ready.

### Example

For a cancellation feature, the story said customers could cancel until the day before delivery. I asked whether a customer in Denver could cancel at 10 p.m. when the warehouse was already on the next day. The team picked the warehouse time zone before implementation. I'd still test the cutoff through the actual cancellation flow.
