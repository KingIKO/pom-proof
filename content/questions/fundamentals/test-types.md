---
title: "What is the difference between a test level and a test type?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "A level names the scope of the system under test; a type names the objective or perspective of the check."
looksFor:
  - "Describes level by the scope under test."
  - "Gives functional and non-functional examples."
  - "Shows that a type can apply at multiple levels."
  - "Avoids equating black-box with UI."
trap: "Treating performance testing as a level that can happen only after system testing."
followUps:
  - question: "Can a component test be black-box?"
    answer: "Yes. I can use the component's public inputs and expected outputs to design a test without reading its implementation."
sources:
  - label: "ISTQB CTFL v4.0.1, sections 2.2.1 and 2.2.2"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I use the level to tell someone what I'm exercising and the type to tell them what I care about. I can test whether a reporting component calculates the right values and whether the whole reporting product shows the right values to the customer. Both are functional tests at different levels. I can also check how quickly the calculation runs or how long customers wait for the complete report.

### Example

I'd check that the monthly summary excludes cancelled invoices at the component level and again in one system flow through to the download. For a performance test I'd measure the time for that download with a month's worth of representative invoices and compare it with the agreed target.
