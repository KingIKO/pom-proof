---
title: "Support and billing disagree about Plus access on June 30. Which plan-change scenario would you keep?"
topic: bdd
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I'd keep the example that settles when Plus access ends. I'd move the plan selector check to a plain test."
looksFor:
  - "Use the July 1 renewal example to agree on the policy before coding."
  - "Check whether the people who own the policy use the example."
  - "Recognize when a feature file only repeats a series of clicks that changes with the layout."
  - "If you move the plan selector to a plain test, keep the assertion that it opens."
trap: "Keeping every written scenario just because the test runner can still run it."
followUps:
  - question: "The July 1 example settles the policy, but moving the selector breaks the test. What would you keep?"
    answer: "I'd keep the July 1 example for policy discussions. I'd repair or replace the check for when access ends. If we still need to check that the selector opens, I'd give it a separate test."
sources:
  - label: Cucumber, discovery and formulation
    url: https://cucumber.io/docs/bdd/
  - label: Cucumber, myths about using a runner and doing BDD
    url: https://cucumber.io/docs/bdd/myths/
  - label: Cucumber, writing better Gherkin
    url: https://cucumber.io/docs/bdd/better-gherkin/
examples:
  - title: A rule support and billing can review together
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Scheduled subscription downgrades
            Scenario: A paid plan lasts until the next renewal
              Given a reader has paid for Plus access until July 1
              When the reader schedules a downgrade to Basic
              Then the reader keeps Plus access until July 1
              And the confirmation shows Basic starting on July 1
---

Before the next change, I'd bring the July 1 example to support, billing, product, and engineering. I'd ask whether the example helps them agree that a reader keeps Plus on June 30 and gets Basic on July 1. If the example helps them reach that agreement, I'd keep the scenario. I'd watch whether the team returns to it when the policy changes.

I'd read the feature file for the plan selector, the control where a reader picks a plan. If it only lists clicks, I'd move the useful assertion, or check, into a plain test. Gherkin is the format for writing scenarios people can discuss. If QA writes them after coding and a moved button breaks them, that format does little to help the team agree on policy.

### Example

I'd ask billing and support whether a paid reader loses Plus the moment they downgrade. I'd record the decision to keep access through the paid period. I'd use a separate test to check that the plan selector opens.
