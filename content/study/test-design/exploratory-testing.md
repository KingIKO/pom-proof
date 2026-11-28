---
title: Exploratory testing and charters
module: test-design
order: 3
level: core
summary: Let what you observe guide the next test. A charter gives the session a goal while leaving room to investigate surprises.
minutes: 2
prerequisites: [testing-foundations/why-we-test]
outcomes:
  - Write a charter that names what you want to learn.
  - Turn an unexpected result into a follow-up test or a question for the team.
useWhen:
  - A feature is new or its rules leave room for questions.
avoidWhen:
  - You need the same known behaviour checked after every change.
questionTopics: [test-design]
sources:
  - { label: "ISTQB CTFL syllabus: Exploratory testing", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
  - { label: "Martin Fowler: Exploratory testing", url: "https://martinfowler.com/bliki/ExploratoryTesting.html", type: practitioner }
---
## What it is

In exploratory testing, you choose a test, try it and judge the result as you learn about the product. What you see helps you pick the next test. In scripted testing, someone writes the steps and expected results before the test runs.

## How it works

One way to structure exploration is to run a session with a time limit. Write a charter, a short note about what you want to learn. Leave the exact steps open. As you go, record what you tried, what happened and what you still want to check.

For example, spend 25 minutes exploring whether a delivery quote stays correct when a shopper edits an address. If the quote stays the same after a postcode change, try reopening checkout. If the quote then changes, record both results. Check the rule for when the quote should refresh before calling it a defect.

After the session, talk through your notes with the team. Share which cases you tried and which you left open. Bring the steps for any failure you could repeat.

## Why it helps

A written script can check only the cases it includes. Exploration gives you room to follow a clue, even after the scripted checks pass. It is useful when the rules are thin or when there is little time to write detailed cases.

Exploration works best with curious testers who can spot unusual behaviour and design a follow-up test on the spot.

## When not to use it

Use a regression test when you need to check that a known behaviour still works after a change. An exploratory session might take a different path each time. If you find a failure you can repeat, turn that case into a scripted check once the team agrees on the expected result.
