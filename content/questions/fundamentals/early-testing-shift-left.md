---
title: "What does shift-left testing look like before a team builds a feature?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: "I look for problems in examples and designs before the code is ready. I keep testing the feature as it starts to run."
looksFor:
  - "Join the discussion before the team writes code."
  - "Ask a specific question that shows where the rule is unclear."
  - "Make an example that the team can use to test the decision."
  - "Keep testing once the feature runs."
trap: "Taking shift-left testing to mean moving every user interface test to the start of the sprint."
followUps:
  - question: "What can you test before you have a place to run the code?"
    answer: "I can review the rule with the product team and write examples. I can also help a developer write checks for the rules the code will follow."
  - question: "If the first group in Denver has the feature, what would make you delay it for the next group?"
    answer: >-
      I'd check what happens near the warehouse cutoff in the canary group, the first group to get the change.
      If the system rejects an allowed cancellation, I'd use the feature flag to keep the change off for the next group while we investigate.
      That way, I see how the rule we agreed on and tested earlier works in the live system.
sources:
  - label: "ISTQB CTFL v4.0.1, sections 1.3 and 2.1.5"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
  - label: Google SRE, canarying releases
    url: https://sre.google/workbook/canarying-releases/
---

I ask to see the user story, or short feature description, while the team can still change the design. That's shift-left testing: I start looking for problems before the team builds the feature. I bring a couple of examples that call for a decision about timing or permissions. An example can also show what the feature should do when the usual steps fail.

Once we agree on the rule, the developer can write a small check for it. I can prepare the data I'll need to test the running feature.

### Example

In one cancellation story, customers could cancel until the day before delivery. I asked whether a customer in Denver could cancel at 10 p.m. if it was already the next day at the warehouse. The team chose the warehouse time zone before writing code. I'd still test the cutoff using the steps customers take to cancel.
