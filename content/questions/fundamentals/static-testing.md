---
title: "What can static testing catch before you run the software?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "Reviews and static analysis can catch defects in work products without executing the software."
looksFor:
  - "Gives an example of reviewing a work product."
  - "Distinguishes a human review from a tool-driven check."
  - "Names something that still requires execution."
  - "Turns a finding into a clear decision or fix."
trap: "Treating a review or a clean static analysis result as proof that a deployed feature works."
followUps:
  - question: "What would you review in a refund story?"
    answer: "I'd check whether the specification covers repeated requests, partial refunds, and what the customer sees while the result is pending."
sources:
  - label: "ISTQB CTFL v4.0.1, chapter 3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I can read a requirement, design, or piece of code and look for a problem before there's anything to deploy. A review can expose contradictory rules or missing error behavior. A static analysis tool can help with code patterns that have a clear rule, such as unreachable code. I record what needs to change and then use execution to check the behavior that depends on real data or running dependencies.

### Example

One screen might say a refund request is accepted before midnight local time, while the service design uses UTC. I'd bring a concrete timestamp to the review and get product to pick the intended rule. We'd still run the feature around midnight after the fix.
