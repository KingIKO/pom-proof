---
title: "Can a passing test suite prove the product has no defects?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "A passing test gives evidence about the conditions it checked; other conditions can still fail."
looksFor:
  - "Distinguishes finding a defect from proving its absence."
  - "Names the inputs, environment, and behavior covered."
  - "Reports a meaningful gap alongside the passing results."
  - "Proposes a next test based on that gap."
trap: "Saying the application is bug free because every scheduled test passed."
followUps:
  - question: "How would you phrase a status update?"
    answer: "Standard checkout passed in staging for signed-in customers. Guest checkout after a declined card still needs coverage."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

If a test fails for a product reason, I have found a defect. If it passes, I can say that particular setup produced the expected result. I include which build and data I used, especially if someone is about to make a release decision. A passing suite tells me more when I know what it was designed to catch and when it last changed.

### Example

Our checkout suite could all pass using US addresses. If we're opening shipping to Canada, I'd add a Canadian address and check the actual options and totals. I'd report that US checkout passed and that international shipping still needed evidence before launch.
