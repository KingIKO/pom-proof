---
title: "How would you explain the test levels on a checkout feature?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Choose a level based on what needs to work together, from one calculation to the whole business workflow."
looksFor:
  - "Distinguishes component from component integration."
  - "Distinguishes system from system integration."
  - "Explains who or what sets acceptance expectations."
  - "Gives matching examples on one feature."
trap: "Calling every test that uses the browser an acceptance test."
followUps:
  - question: "Where would you first test a rounding rule?"
    answer: "At the pricing component, where I can specify the numbers directly and identify the calculation that failed."
sources:
  - label: "ISTQB CTFL v4.0.1, section 2.2.1"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I call them levels because the scope changes. A component test can check a calculation alone. Component integration checks cooperating pieces within the system. A system test checks the behavior of the assembled product, and system integration checks its interaction with another system. At acceptance I look for evidence it meets the business or user needs that decide whether it can be accepted.

### Example

For checkout I'd test rounding in pricing, then check that order creation uses the amount pricing returns. I'd exercise the assembled checkout with controlled dependencies, and separately prove it can exchange a payment with the provider's sandbox. For acceptance, operations might try looking up and refunding an order using their actual support tools.
