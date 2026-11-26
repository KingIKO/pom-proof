---
title: "How do verification and validation differ?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Verification checks specified requirements; validation checks whether the product meets the needs of its intended users."
looksFor:
  - "Gives each activity a distinct reference point."
  - "Keeps the same feature in both examples."
  - "Identifies who can confirm the real workflow."
  - "Explains why doing only one leaves a gap."
trap: "Defining verification as manual testing and validation as automated testing."
followUps:
  - question: "Does validation have to wait until release?"
    answer: "No. I can use a prototype and realistic examples to learn whether the proposed workflow works for the people using it."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.1"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

In verification I compare what we've built with a specific requirement. In validation I ask whether someone can use it to get the intended result in their working conditions. I do both because the requirement can miss an important detail, and because a workflow that looks right on a demo may still violate a rule.

### Example

Say a warehouse scanner must accept a 12-digit label and show its package record. I'd verify that a supported label opens the right record and an incomplete one is rejected. I'd validate the workflow with a picker wearing gloves, moving between aisles with patchy coverage, who needs to know whether a scan actually counted.
