---
title: "How does the test pyramid change what you automate?"
topic: fundamentals
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: "Cover rules with fast focused tests, exercise handoffs at integration level, and use a smaller set of end-to-end journeys."
looksFor:
  - "Explains why scope matters for speed and diagnosis."
  - "Names which handoffs need integration evidence."
  - "Keeps a small set of journeys that require the actual UI."
  - "Avoids applying a fixed ratio without context."
trap: "Doing every check through the browser or removing browser checks simply to improve the pyramid shape."
followUps:
  - question: "How do you decide which UI tests to keep?"
    answer: "I keep the ones that would fail for a real user-visible regression the lower-level checks can't see, such as a disabled submit button."
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.1.6"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I start with the simplest test that can catch the failure. A pricing rule usually needs many inputs, and those cases are fast to run and diagnose when I can call the calculation directly. I use integration checks where components may disagree about the data they exchange. Then I keep end-to-end checks for customer journeys where the whole setup matters. The right mix depends on where bugs appear and how confidently we can diagnose a failure.

### Example

For delivery options I'd check the cutoff at the rule level and test that checkout uses the fulfilment service's dates. I'd keep a browser test that selects pickup and proves the selected location appears on the order confirmation.
