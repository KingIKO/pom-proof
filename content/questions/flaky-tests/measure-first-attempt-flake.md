---
title: "How do you measure flakiness without making the numbers misleading?"
topic: flaky-tests
roles: [automation, sdet, senior]
level: senior
type: concept
oneLine: "I say what I count and what total I divide it by. I keep first results visible and compare runs with the same retry rules."
looksFor:
  - "Count each test execution once instead of counting every attempt."
  - "Explain what a failure followed by a pass can show and what it can't."
  - "Report machine or setup failures and missing results separately."
  - "Give the number of executions and the period measured."
trap: "Reporting only the final pass rate or comparing runs that used different retry rules."
followUps:
  - question: "What if only failed jobs got another attempt during one period?"
    answer: "I'd report that period separately. I'd say which runs could retry and which completed a retry because the recovery rates aren't directly comparable."
---

I measure flakiness, when tests sometimes pass and sometimes fail under the same conditions. I count logical executions, meaning each test and browser combination counts once per run. I count the ones that fail first and later pass on the same code revision. I divide by all the executions that started under the same retry rules.

I share counts with the percentages and report first-attempt failures separately. If a retry result is missing, I can't count that execution as a recovered flake. I split the numbers by test, browser, and environment. That helps me tell a test that often fails from a bad day on a machine running the tests.

Even a documented failure followed by a pass doesn't tell me what caused it. The cause could be a test race, where the result depends on which actions finish first. It could also be a problem with the machines or services that run the tests, or a bug in the app.

### Example

If 12 of 400 executions fail first and pass on retry, I'd report 3% observed retry recovery. I'd say how many failed on every attempt. I'd name the time period and list canceled runs separately.
