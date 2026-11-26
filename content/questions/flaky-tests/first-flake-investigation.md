---
title: What do you do when a test passes locally and fails intermittently in CI?
topic: flaky-tests
roles: [automation, sdet]
level: mid
type: scenario
oneLine: Preserve the first failure, reproduce the CI conditions, and change one suspected cause at a time.
looksFor:
  - Evidence from the first failed attempt
  - Commit, data, and worker context
  - A controlled reproduction that changes one variable
  - Proof that the check still detects a product defect
trap: Calling it a runner problem after a single green local run.
followUps:
  - question: What if it only fails on a busy runner?
    answer: I'd compare timing and resource evidence under representative load. That can expose a test assumption or a real product slowdown.
---

I keep the first failed attempt and record the commit, environment, and input. I look for the earliest thing that disagreed with the expected flow. Maybe the app returned an empty result. Maybe two tests used the same account. A screenshot of the final timeout doesn't settle either question.

I run the same revision with the same inputs and test alongside its neighbors if that's how CI failed. I change one thing at a time so I can link the symptom to a cause. Once I fix it, I repeat the conditions that triggered it and check that a wrong product result still makes the test fail.

### Example

Suppose a notification check fails for one worker. I compare the request IDs and find its neighbor clears the same inbox. I'd give each test its own recipient and rerun the pair concurrently.
