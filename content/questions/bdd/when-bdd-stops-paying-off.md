---
title: Support and billing disagree about Plus access on June 30. Which plan-change scenario would you keep?
topic: bdd
roles: [sdet, senior]
level: senior
type: concept
oneLine: Keep the example that settles when Plus access ends and move the plan selector check to a plain test.
looksFor:
  - Uses the July 1 renewal to settle a decision before implementation.
  - Checks whether the people who own the downgrade policy use the example.
  - Recognizes when a feature file has become a brittle click script.
  - Preserves the selector assertion if it moves to a plain test.
trap: Preserving every feature file because the runner can still execute it.
followUps:
  - question: The July 1 example settles the access question, but moving the selector breaks its automation. What would you keep?
    answer: I'd keep the July 1 example for the next policy discussion and repair or replace the automation that checks the cutoff. I'd give the selector its own test if we still need that behavior covered.
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

I'd bring the July 1 example to support, billing, product and engineering before the next
change. If they can use it to agree that a reader keeps Plus on June 30 and sees Basic start
on July 1, that scenario has a reason to stay. I'd see whether the team comes back to it when
the rule changes.

I'd open the feature file for the plan selector and see what it proves. If it only walks
through controls, engineers can keep the useful assertion in a plain test. When QA writes
feature files after coding and moving a button breaks their steps, keeping them in Gherkin
does little to help people agree on the policy.

### Example

Billing and support care whether a paid reader loses access immediately on a downgrade. The
scenario captures the decision to keep access through the paid period. A separate test can
check that the plan selector opens without making that click part of the policy.
