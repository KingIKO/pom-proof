---
title: "Why can't you test every possible case?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "Except on very small problems, the possible combinations outgrow the time available, so I choose cases that cover distinct risks."
looksFor:
  - "Explains why combinations grow across inputs and states."
  - "Keeps distinct outcomes instead of repeating near-identical cases."
  - "Tests boundaries and expensive failures."
  - "States which cases were left out."
trap: "Confusing a list of every input field with coverage of every interaction."
followUps:
  - question: "When might you cover every value?"
    answer: "For a pure switch that takes one of four fixed states and has no other inputs, I can cover all four cheaply."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

Even when a feature has only a few settings, the number of cases grows once I include roles, data already on the account, and what happens on retry. I start by asking which combinations change the expected behavior. I keep one representative where the rule treats inputs the same, and test the edges where the rule switches. If a specific combination carries a big loss, I test it directly rather than hope the general set covers it.

### Example

In delivery settings I'd test that a restricted postcode never offers next-day shipping, even on an account with express delivery. I'd spend less time combining that same rule with every saved address label.
