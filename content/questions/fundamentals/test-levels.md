---
title: "What would you check at each test level for checkout?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I choose a test level based on how much needs to work together, from one calculation to the whole business task."
looksFor:
  - "Tell testing one piece of the app apart from testing how pieces work together."
  - "Tell testing the whole app apart from testing its connection to another system."
  - "Say whose needs determine whether the team accepts the feature."
  - "Give an example of each level using the same feature."
trap: "Assuming that any test in a browser proves the product meets the user's or business's needs."
followUps:
  - question: "Which part would you test first for a rule about rounding prices?"
    answer: "I'd start with the piece that calculates prices. I can give it exact numbers and tell which calculation failed."
sources:
  - label: "ISTQB CTFL v4.0.1, section 2.2.1"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

A test level tells me how much of the system I'm testing. In a component test, I check one piece on its own, such as a calculation. In a component integration test, I check how pieces of the same system work together.

In a system test, I check the assembled product. In a system integration test, I check how that product works with another system. In an acceptance test, I look for evidence that the product meets the business or user needs that decide whether it can be accepted.

### Example

For checkout, I'd first test rounding in the code that sets prices. Then I'd check that order creation uses the amount that code returns. I'd test the assembled checkout with the services it depends on under my control. Separately, I'd prove it can send and receive payment data with the provider's sandbox, a test version of its service. For acceptance, I might ask operations staff to look up and refund an order with the support tools they use at work.
