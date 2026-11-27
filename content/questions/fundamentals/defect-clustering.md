---
title: "How do you use defect clustering without overlooking other areas?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I test areas with repeated problems more closely. I also save time for risky areas the team has rarely tested."
looksFor:
  - "Name a way to group related defect reports."
  - "Consider how many people use each area and how much testing it gets."
  - "Use the groups to find new cases to test as well as cases to repeat."
  - "Keep basic checks for other tasks users depend on."
trap: "Splitting test time by bug counts alone or treating one fixed split as a rule."
followUps:
  - question: "When would you spend less time on an area with repeated problems?"
    answer: "I'd check that we removed the shared cause and tested the related paths. I'd also check that the failure stopped showing up in recent releases."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I group recent defects by where they started, regardless of which screen showed them. Defect clustering means looking for groups of problems like these. If several failures come from the same change in the system's state or from the same service, I test the paths that share it.

I check whether the places with the most reports are also the places we test most. If no one reported a bug in an area, it might work well or rarely get tested. I'd make a different choice about what to test in each case.

### Example

If returns, refunds, and order history break after partial cancellations, I'd group those problems under the change to the order's state. I'd test that change in every affected feature and keep a smoke test, or quick basic check, for checkout. I'd also test the new pickup flow closely because it has too little defect history to guide me.
