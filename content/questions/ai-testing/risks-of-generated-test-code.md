---
title: "Generated late-fee tests pass when the app charges too early. Which tests would you keep?"
topic: ai-testing
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd keep a test only if it catches a fee policy violation and the team can run and maintain it safely."
looksFor:
  - "Show that the day-one check fails on the build that charges too early."
  - "Work out the expected charge from the written policy."
  - "Replace unsafe test data before anyone runs or shares the draft."
  - "Ask the maintainer to run the draft with the team's existing helpers and checks."
trap: "Assuming a passing set of generated tests has the right expected results."
followUps:
  - question: "After fixing day one, the test still passes with a one-cent charge. What should it check?"
    answer: "I'd check that the amount on day one is exactly zero. I'd run the test on the one-cent version and make sure that specific check fails."
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

If the policy says the first late day is free, I'd replace the draft's expected charge with zero. I'd run it against the version that charges early and check that it fails. A test that accepts any number can't catch the wrong amount.

Before I run the draft, I'd review the test's fixtures, the data and setup it needs to run. If the draft contains real patron details or credentials, I'd replace them with fictional data. I'd ask the person who owns fee tests to review the setup and keep the test up to date when the policy changes.

I'd run lint and type checks. These can flag problems with our code conventions or how the draft calls a helper. I'd also run the test locally to catch setup errors those checks miss.

### Example

The first late day is free. The draft expects an immediate fee because the app charges one. I'd correct the expected result and show the test fails on the faulty version. If the test only checks that the app returns a number, I'd change it to check for exactly zero.
