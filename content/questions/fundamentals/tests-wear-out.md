---
title: "What does ISTQB mean by 'tests wear out'?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "Repeated tests can stop finding new defects, so I refresh their data and cases without discarding checks that protect important behavior."
looksFor:
  - "Recognizes the earlier name, pesticide paradox."
  - "Explains why repeating unchanged tests finds fewer new defects."
  - "Retains useful regression checks."
  - "Names a specific trigger for expanding coverage."
trap: "Deleting a critical regression check simply because it has passed for several releases."
followUps:
  - question: "What would make you add a fresh case?"
    answer: "A new way users reach the feature, a changed rule, or a defect pattern our existing data cannot expose."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
  - label: "ISTQB CTFL v3.1.1, section 1.3"
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB-CTFL_Syllabus_2018_v3.1.1.pdf#page=17
---

The current CTFL title is “tests wear out.” The idea was previously taught as the pesticide paradox. If I use the same accounts and inputs on each release, I'll catch some regressions in the behavior those checks cover. I'll probably keep missing failures that need a different setup. I review cases after a release changes how customers use the feature and after support reports a pattern our suite never exercises.

### Example

I'd keep a test that proves a gift card reduces the total at checkout. If a new balance system allows two cards on one order, I'd add mixed balances and a card that runs out halfway through the purchase. The original check still earns its place.
