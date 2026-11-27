---
title: "Can a passing test suite prove the product has no defects?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I use a passing test as evidence for the conditions it checked. Other conditions may still cause failures."
looksFor:
  - "Explain why a test can find a defect without proving the app has none."
  - "Name what you entered, where you ran the test, and what behavior you checked."
  - "Name an important gap when you report the passing results."
  - "Suggest a test to fill that gap."
trap: "Calling the app bug-free after all the planned tests pass."
followUps:
  - question: "How would you report what passed and what you didn't cover?"
    answer: "I tested standard checkout for signed-in customers in staging, a test environment, and it passed. I still need to test guest checkout after a card is declined."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

If a test fails because the product does something wrong, I've found a defect. If a test passes, I know that setup gave me the result I expected. I record the app version and data I used, especially when someone is deciding whether to release. When I read the results from a test suite, or group of tests, I check which bugs it aims to catch. I also check when the suite last changed.

### Example

I could pass every checkout test using US addresses. If we plan to ship to Canada, I'd add a Canadian address and check which options and totals appear. I'd report that US checkout passed and that we still need evidence for international shipping before launch.
