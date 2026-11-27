---
title: A second branch places a hold on the loan. What changes in your renewal test design?
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Explain which renewal cases come from the published rule and which depend on how holds are stored or checked.
looksFor:
  - Explains why the hold table suggests testing a reservation from another branch.
  - Distinguishes that case from forcing the two outcomes of the code's hold decision.
  - Gives a case that can be derived from the library's public renewal rule.
  - Classifies cases by how they were designed instead of where they run.
trap: Calling every API check grey-box because it does not use the browser.
followUps:
  - question: The hold table changes but the library keeps the same renewal policy. Which case would you keep as written?
    answer: I'd keep the case written from the public no-hold rule. I'd revisit any fixture that relies on the old hold table and any case whose purpose was to exercise a particular code path.
sources:
  - label: ISTQB CTFL v4.0.1, sections 2.2.2 and 4.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: NIST glossary, grey-box testing
    url: https://csrc.nist.gov/glossary/term/gray_box_testing
---

Knowing that the hold table records a branch gives me a case I might otherwise miss. I'd
seed a hold at the second branch and use the renewal API like any other client. That's grey-box:
internal information shaped the setup, and the response is still my evidence.

I can use the same API for a black-box check if I derive the case from the public rule alone.
If I inspect the renewal function to make sure my cases exercise both outcomes of its hold
decision, that design is white-box. I could also test the function directly from its contract;
calling it at unit level says nothing about how I chose the case.

### Example

For a library renewal, I'd use the public no-hold rule to check an eligible loan, inspect the
renewal function to force each outcome in its hold branch, and use knowledge of the hold table to
seed a reservation from a second branch before trying the renewal API again.
