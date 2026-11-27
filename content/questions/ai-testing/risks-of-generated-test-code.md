---
title: Every generated late-fee test passes, including one that charges on day one. What would you keep?
topic: ai-testing
roles: [automation, sdet]
level: mid
type: concept
oneLine: Keep only tests that fail on a violation of the fee policy and that the team can safely run and maintain.
looksFor:
  - Shows that the day-one check fails against the build that charges too early.
  - Gets the expected charge from the written fee policy.
  - Replaces unsafe fixtures before anyone runs or shares the draft.
  - Asks the maintainer to show the draft runs with the team's existing helpers and checks.
trap: Treating a passing generated suite as proof that its expected results are correct.
followUps:
  - question: After you fix day one, the same generated check still passes with a late fee of one cent. What does it need to assert?
    answer: >-
      I'd check that the amount on day one is exactly zero. Then I'd run it against the
      one-cent version and confirm the failure comes from that assertion.
sources:
  - label: On the evaluation of LLM unit tests, unresolved API symbols (accessed 2026-11-27)
    url: https://arxiv.org/html/2406.18181
  - label: GitHub Copilot, generated code accuracy and review (accessed 2026-11-27)
    url: https://docs.github.com/en/copilot/responsible-use/inline-suggestions
  - label: Stryker, testing assertion strength with mutations (accessed 2026-11-27)
    url: https://stryker-mutator.io/docs/
  - label: NIST AI RMF Playbook, roles and accountability (accessed 2026-11-27)
    url: https://airc.nist.gov/airmf-resources/playbook/govern/
---

I'd discard the day-one expectation if the rule says that day is free. I'd replace it with
an assertion for zero and show it fails on the version that charges early. A test that checks
only for a returned number wouldn't catch that problem.

I'd review what the draft runs with before executing it. If it contains real patron details or
credentials, I'd replace them with fictional records. I'd ask the person responsible for fee
tests to check how the fixture fits the suite and to own future policy changes. The usual lint
and type checks can flag convention and helper mistakes. A local run can expose setup errors
those checks miss.

### Example

The first late day is free, but a draft expects a fee immediately because that's what the current
code does. I'd correct the expected result and prove the test fails on that faulty version. If
the test only asserts that a numeric value came back, I'd replace it with the expected zero.
