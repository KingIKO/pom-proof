---
title: "Tell me about a group of tests that failed inconsistently. How did you make it more reliable?"
topic: behavioral
roles: [automation, sdet, senior]
level: mid
type: behavioral
oneLine: "I found the main cause, fixed it, and measured first attempts so reruns wouldn't hide failures."
looksFor:
  - "Name what you investigated and changed yourself."
  - "Give the failure count and total runs before and after the change."
  - "Share evidence from the conditions that made the tests fail."
  - "Explain a lesson you can apply to other tests."
trap: "Saying the tests got more reliable after giving them more time without showing why failures happened."
followUps:
  - question: "How did you check that the tests could still catch a wrong result?"
    answer: "I ran the original scenario with a result I knew was wrong. I checked that the assertion, the part of the test that compares results, flagged it."
---

Our group of returns tests blocked merges even when nobody had changed the returns code. I was asked to find the main cause. I marked the first-attempt failures for two weeks and noticed that several overlapping runs used the same account. One test was reading the account's history while another changed it.

I added a fixture, code that prepares test data. It created a separate return for each test and saved the ID so I could clean it up. I tried it first with the two checks that had interfered with each other. Then I ran the same test schedule for another two weeks. First-attempt failures fell from 22 of 180 runs to 3 of 180.

### Example

I saw one test withdraw a return while another opened it for review. With separate returns, I could run both tests at the same time and keep their original assertions, the checks for expected results. I learned to track why tests fail before changing how long they wait.
