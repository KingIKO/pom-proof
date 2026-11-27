---
title: "How does a test level differ from a test type?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I use the level to say how much of the system a test covers. I use the type to say what I want to learn or how I look at it."
looksFor:
  - "Describe each level by which parts it tests."
  - "Give examples of tests that check what the app does and how well it does it."
  - "Show how the same type of test can apply to different parts of the system."
  - "Explain why a test based on public behavior can run outside the user interface."
trap: "Treating performance testing as a level that can happen only after system testing."
followUps:
  - question: "Can a component test be black-box?"
    answer: "Yes. I'd choose the inputs and expected results using what the piece promises to callers. That's a black-box test, even though I test just one component."
sources:
  - label: "ISTQB CTFL v4.0.1, sections 2.2.1 and 2.2.2"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I use the test level to say which parts I run. I use the test type to say what I'm checking or how I chose the test. A functional test checks what the software does. I can check whether a reporting component, or one part of the app, calculates the right values. I can also check whether the whole product shows those values to the customer.

Those are functional tests at different levels. For a non-functional test, I can measure how well it works, such as how fast the calculation runs. I can also measure how long customers wait for the whole report.

### Example

I'd check that the code that builds the monthly summary leaves out cancelled invoices. I'd check that rule again in a system test, which runs the whole task through to downloading the summary. For a performance test, which measures speed here, I'd time the download with a month's worth of typical invoices. I'd compare the time with the agreed target.
