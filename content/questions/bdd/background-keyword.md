---
title: "What shared details belong in the Background for library pickup?"
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd put short, shared facts about pickup in Background. I'd use a hook for technical setup."
looksFor:
  - "Say when Cucumber runs a feature's Background."
  - "Include only facts every scenario needs."
  - "Keep a fact in its own scenario if it applies only there."
  - "Tell visible Background steps apart from a Before hook readers can't see in the feature."
trap: "Hiding a fact that explains the expected result in a hook readers can't see in the feature."
followUps:
  - question: "What if only half the cases need a closed branch?"
    answer: "I'd say the branch is closed in each case that needs it. I could also group those cases under a named rule with its own Background."
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

I'd use Background, a group of shared Given steps, for facts every scenario in the feature needs. Cucumber runs those steps before each scenario and after any Before hooks. If the Background takes a whole screen, I'd shorten it or split the feature into smaller ones.

A Before hook runs setup code outside the written feature. I'd use it for setup that readers don't need to understand the rule, like opening a separate browser session. If a fact affects what the member should experience, I'd put it in the scenario or Background so readers can see it.

### Example

I'd use one line in Background to say the member already requested a book. I'd then check two different results. When the book becomes available, I expect a pickup notice. If the member cancels the request, I expect no notice.
