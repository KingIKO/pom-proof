---
title: "What problems can you find without running the software?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "I can catch problems by reading the requirements, design, or code. I can also use tools that check the code without running it."
looksFor:
  - "Give an example of reviewing something the team wrote."
  - "Explain what a person can review and what a tool can check."
  - "Name a check that requires running the app."
  - "Use a finding to help the team make a decision or fix a problem."
trap: "Assuming a feature works after release because a review or a tool found no problems in the source."
followUps:
  - question: "What would you look for in a written refund requirement?"
    answer: "I'd look for rules about repeated requests and partial refunds. I'd check what the customer should see while they wait for the result."
sources:
  - label: "ISTQB CTFL v4.0.1, chapter 3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

Static testing means looking for defects without running the software. I can read a requirement, design, or piece of code before we have anything to deploy. In a review, I can spot rules that disagree or ask what should happen when something fails.

I can also use static analysis, a tool's check for code that breaks a known rule. For example, it can find code that can never run. I record what needs to change. I still run the software to check behavior that depends on real data or other services.

### Example

If a refund screen promises to accept requests before local midnight, I'd compare that promise with the service design. The design might use UTC, a global time standard. I'd bring a specific time to the review and ask the product team which rule to follow. After the fix, I'd still test the running feature around midnight.
