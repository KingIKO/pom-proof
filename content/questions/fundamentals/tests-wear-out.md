---
title: "What does ISTQB mean by 'tests wear out'?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "If the same tests stop finding new bugs, I'd try fresh data and cases. I'd keep the checks that protect important behavior."
looksFor:
  - "Recognize that the same idea used to be called the pesticide paradox."
  - "Explain why unchanged tests may catch fewer new bugs over time."
  - "Keep tests that still catch breaks in behavior that matters."
  - "Name a specific change or bug report that would make you add tests."
trap: "Removing a test for important behavior just because it has passed for several releases."
followUps:
  - question: "What would tell you it's time to add a test?"
    answer: "I'd add a case if users reach the feature a new way or the rules change. I'd also add one if our current data can't reveal a pattern of bugs."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
  - label: "ISTQB CTFL v3.1.1, section 1.3"
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB-CTFL_Syllabus_2018_v3.1.1.pdf#page=17
---

ISTQB, the International Software Testing Qualifications Board, calls this principle "tests wear out" in its foundation-level testing syllabus (CTFL). Earlier versions called it the pesticide paradox. Both describe how repeating the same tests can stop uncovering new bugs.

If I use the same accounts and inputs on each release, I'll catch some regressions, or breaks in behavior that worked before. I'll probably keep missing bugs that need different starting conditions. I review the tests if a release changes how people use the feature. I also review them if support sees a pattern the tests never check.

### Example

I'd keep the test that shows a gift card reduces the checkout total. If a new system lets shoppers use two cards on one order, I'd test cards with different balances. I'd also test a card that runs out halfway through the purchase. The old test still checks a rule customers rely on.
