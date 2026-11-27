---
title: What belongs in the Background of a library pickup feature?
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Put short shared business context in Background and keep technical setup in a hook.
looksFor:
  - Knows when Cucumber runs a feature-level Background.
  - Uses context that is true and useful in every scenario.
  - Keeps case-specific conditions in their own scenarios.
  - Distinguishes a Background from an invisible Before hook.
trap: Hiding facts that explain an expected result in a hook nobody reading the feature can see.
followUps:
  - question: What if only half the scenarios need a closed branch?
    answer: Keep that fact in those scenarios, or separate them under a named rule with its own context.
sources:
  - label: Cucumber, Background
    url: https://cucumber.io/docs/gherkin/reference/#background
  - label: Cucumber, scenario hooks
    url: https://cucumber.io/docs/cucumber/api/#scenario-hooks
examples:
  - title: Shared context for pickup notices
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Library pickup notices
            Background:
              Given a library member has requested a book for pickup

            Scenario: A pickup notice when a book becomes available
              When the branch marks the book ready
              Then the member receives a pickup notice

            Scenario: No pickup notice when a request is cancelled
              When the member cancels the request
              Then the member receives no pickup notice
---

I'd use a feature-level Background for a small piece of business context every scenario needs.
Cucumber runs those Given steps before each scenario, after any Before hooks. If it takes a
reader a whole screen to get from the context to the scenario, I'd look for a shorter
description or break up the feature.

A Before hook is for setup readers don't need to understand the rule, like creating an isolated
browser session. A condition that affects what the member should experience belongs in the
scenario or the Background where people can see it.

### Example

Both pickup cases start with the member's existing request. It takes one line to put that
context in view. Making the book available should send a pickup notice; cancelling the
request should send no pickup notice.
