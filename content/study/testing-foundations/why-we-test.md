---
title: Why we test
module: testing-foundations
order: 1
level: core
summary: Testing finds defects and gives the team evidence about how well a product works. That evidence helps the team decide what to fix and when to release.
minutes: 2
prerequisites: []
outcomes:
  - Tell an error, a defect and a failure apart using one example.
  - Explain what a passing test can tell you about a release.
  - Use the seven testing principles to choose what to check.
useWhen:
  - You need to explain what a set of checks tells the release owner.
avoidWhen:
  - You want a passing result to stand in for feedback from actual users.
questionTopics: [fundamentals]
sources:
  - { label: "ISTQB: Foundation Level syllabus, sections 1.1 to 1.3", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
---
## What it is

Testing evaluates software and related work, such as requirements, to find defects and assess quality. You can run the product or review its design without running anything. Either way, the results help the team understand what could go wrong.

## How it works

Suppose a developer misreads a booking rule. That's an error, a human mistake. The wrong comparison in the code is a defect, a flaw that can cause the system to behave incorrectly. When a user is turned away from a valid time slot, that's a failure. An unclear cutoff in the booking rules could be the root cause, the underlying reason for the mistake.

Testing exposes the problem. Debugging finds and fixes the cause of the failure. Quality assurance, or QA, improves how the team works to prevent defects. For example, the team could agree on cutoff examples before anyone writes the code.

## Why it helps

The International Software Testing Qualifications Board (ISTQB) describes seven principles. Each suggests a decision you can make about a booking feature:

1. Tests can reveal defects. Passing tests do not prove that no defects remain. Report which cutoff cases passed and which you still haven't tried.
2. Exhaustive testing is impossible except in trivial cases. For a booking site, choose representative dates and times instead of attempting every combination.
3. Test early. Review the cutoff rule before it becomes code and before other features depend on it.
4. Defects tend to cluster in a few areas. If time zones keep causing failures, give them more attention.
5. Tests wear out as a way to find new problems. Add a daylight saving case, and keep the existing checks to catch old problems returning.
6. Testing depends on context. A hospital may need deeper checks of booking availability than a hobby club does.
7. The absence-of-defects fallacy is the belief that meeting the written rules guarantees success. A booking app can meet its rules and still be unusable for reception staff.

## When not to use it

Use verification to check the stated requirements. Also use validation to check that the product serves users' real needs. Have reception staff try an actual scheduling task. In an interview, say what your tests showed, what they left open and how that shaped your release advice.
