---
title: "How do verification and validation differ?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "In verification, I check the written requirements. In validation, I check that the product meets the needs of the people who will use it."
looksFor:
  - "Say what you compare the product against in each check."
  - "Use the same feature to illustrate both kinds of check."
  - "Name who can tell you whether the steps work in practice."
  - "Explain what each kind of check can miss on its own."
trap: "Defining verification as manual testing and validation as automated testing."
followUps:
  - question: "Does validation have to wait until release?"
    answer: "No. I can have users try a prototype, an early model of the feature, with realistic examples. I'd see whether the proposed steps work for them."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.1"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

In verification, I check what we built against a specific requirement. In validation, I check whether people can get the result they need under real working conditions. I do both because a written requirement can miss an important detail. I also know that a feature may look right in a demo and still break a rule.

### Example

If a warehouse scanner must accept a 12-digit label, I'd check that a supported label opens the right package record. I'd also check that the scanner rejects an incomplete label. To validate the steps, I'd test with a worker who picks items while wearing gloves and moving through aisles with an unreliable connection. I'd check whether they can tell if each scan counted.
