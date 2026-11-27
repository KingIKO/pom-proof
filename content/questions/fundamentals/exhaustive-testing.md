---
title: "Why is exhaustive testing usually impractical?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Except for very small problems, I have too many combinations to test in the time available. I choose cases that cover different risks."
looksFor:
  - "Explain why combining inputs and starting states adds cases."
  - "Keep cases that lead to different results and cut near-duplicates."
  - "Test where the rule changes and where a failure would be costly."
  - "Name the cases you skipped."
trap: "Assuming that testing each input on its own covers how fields work together."
followUps:
  - question: "What would make it practical to test every value?"
    answer: "If a switch takes one of four fixed states and nothing else affects its result, I can test all four quickly."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

Exhaustive testing means trying every possible case. Even if a feature has few settings, I get more cases when I include user roles, existing account data, and repeat attempts. I first ask which combinations change the expected result.

If the rule treats several inputs alike, I pick one to stand for the group. I test the boundaries, or points where the rule changes. If a particular combination could lead to a big loss, I test it directly so I know the suite covers it.

### Example

For delivery settings, I'd test that a restricted postcode never offers next-day shipping, even if the account has express delivery. I'd spend less time repeating that same check for every label on a saved address.
