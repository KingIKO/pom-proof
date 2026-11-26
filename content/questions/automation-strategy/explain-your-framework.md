---
title: How would you explain your automation framework to a new teammate?
topic: automation-strategy
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: Walk one test from its data setup to its failure report, then explain a design choice and its cost.
looksFor:
  - A real test that makes architecture legible
  - Where setup and assertions live
  - How someone diagnoses a CI failure
  - A deliberate tradeoff and a way to measure it
trap: Reciting a directory tree or tools list without explaining how a test runs or fails.
followUps:
  - question: What would you change if the suite doubled?
    answer: I'd measure where time goes first. Slow seed endpoints call for a different fix than slow browser startup or congested runners.
---

I'd start with one spec and follow it through the run. I show where the test gets data, which screen interactions it owns, and the lines that state the result. Then I open a failure report and show what a teammate can use to tell a setup problem from a product bug.

I'd explain one choice that has a cost. Our team might prepare records through an API to shorten browser runs, which means a setup service outage can stop those runs. I'd explain how the report exposes that failure and which suite still tests the normal customer path. The teammate should be able to add a test and read its first failure after the walkthrough.

### Example

I'd show the booking cancellation spec. It creates an appointment, changes it from the customer screen, and checks the released slot in the calendar. On CI I'd show where to find the appointment ID and the failing step.
