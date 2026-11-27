---
title: "How would you explain your automation framework to a new teammate?"
topic: automation-strategy
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: "I'd walk through one test from setup to its failure report. I'd explain one design choice and what it costs."
looksFor:
  - "Pick a real test that shows how the pieces fit together."
  - "Show where the test gets its data and checks the result."
  - "Show how to investigate a failure in CI."
  - "Explain one tradeoff and say how you'd measure it."
trap: "Listing folders and tools without showing how a test runs or what a failure looks like."
followUps:
  - question: "What would you change if the suite grew to twice its size?"
    answer: "I'd first measure where time goes. I'd fix slow setup requests differently from slow browser startup or a queue of jobs waiting to run."
---

I'd explain the automation framework, the shared tools and code that help us write and run tests, with one test file. I'd follow it through a run and show where it gets its data and which screen actions it handles. I'd point to its assertions, the lines that check the expected result. Then I'd open a failure report and show how to tell a setup failure from a bug in the product.

I'd explain one choice the team made. For example, I might create records through an API, an interface code can call, to shorten browser runs. If that setup service goes down, it can stop the runs. I'd show what the failure looks like and point to the suite that still tests the usual customer path. Afterward, I'd expect the teammate to be able to add a test and read its first failure.

### Example

I'd show our booking cancellation test. It creates an appointment, cancels it on the customer screen, and checks that the calendar shows the slot as open. In continuous integration (CI), I'd point out the appointment ID and the step that failed.
