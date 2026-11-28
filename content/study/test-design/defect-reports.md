---
title: Defect reports
module: test-design
order: 5
level: core
summary: Describe a failure so someone else can try it, judge the impact and check a fix.
minutes: 2
prerequisites: [testing-foundations/why-we-test]
outcomes:
  - Write a report that another tester can follow from a known starting point.
  - Explain how the impact of a defect differs from its priority.
useWhen:
  - Someone else needs enough detail to investigate a problem you saw.
avoidWhen:
  - The report claims a cause you have only guessed.
practiceTopics: [defect-reporting]
questionTopics: [bug-reports]
sources:
  - { label: "ISTQB CTFL syllabus: Defect management", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
---
## What it is

A defect report records a problem so someone else can reproduce it, which means making it happen again. Name the action and the visible failure in the title. The team can investigate and decide whether the report describes a defect or something else, such as a request for a change.

## How it works

Record the report ID, its status, who saw the failure and when it happened. Include the build, which is the version under test, and where you ran it. Describe the starting setup and the steps that lead to the failure. List what happened separately from what you expected. Link the relevant test or rule and attach evidence that shows the failure.

Severity describes the impact, such as an instructor losing sight of a booked class. Priority describes how soon it needs a fix.

For example, a report could read like this:

- Title: Rescheduled booking is missing from the calendar after reload.
- Setup: Test server, build 218, signed in as an instructor with a booking at 10:00.
- Steps: Move the booking to 11:00, save it and reload the calendar.
- Expected: The same booking appears at 11:00, as the rescheduling rule requires.
- Actual: The booking appears at neither time after reload.
- Evidence: A recording with test data shows the move, save and reload.
- Severity: High, because instructors can lose track of rescheduled classes.
- Priority: Fix before the new calendar goes live.

## Why it helps

The report gives the person investigating a way to see the same failure. Over time, reports help the team track quality and improve how it builds and tests.

## When not to use it

If you cannot repeat the failure, report what you saw and what you could not confirm. If the product rule is unclear, label the expected result as a question. A report needs observations the team can check. Leave guesses about the cause out of the title.
