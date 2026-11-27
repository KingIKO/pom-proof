---
title: "How would you run only the finished checkout smoke scenarios in Cucumber?"
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd label scenarios by area or purpose. I'd tell Cucumber which labels to include or skip."
looksFor:
  - "Tag a scenario and say what happens when the whole feature has the tag."
  - "Combine conditions that include and exclude scenarios."
  - "Explain how a tag limits when setup code runs."
  - "Keep each tagged scenario independent of run order."
trap: "Using tags to force scenarios to run first and second because one depends on the other's data."
followUps:
  - question: "How would you limit browser setup to the scenarios that need it?"
    answer: "I'd put a browser tag on those scenarios or their feature. I'd give the setup hook a condition that matches that tag."
sources:
  - label: Cucumber tags, filtering, and conditional hooks
    url: https://cucumber.io/docs/cucumber/api/#tags
  - label: Cucumber-JVM JUnit Platform engine configuration
    url: https://github.com/cucumber/cucumber-jvm/tree/main/cucumber-junit-platform-engine
examples:
  - title: Mark ready and unfinished checkout smoke cases
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Checkout for local pickup
            @checkout @smoke
            Scenario: The shopper places an order for pickup
              Given pickup is available for the shopper's basket
              When the shopper places a pickup order
              Then the confirmation says the order is for pickup

            @checkout @smoke @wip
            Scenario: The shopper uses store credit on a pickup order
              Given pickup is available and the shopper has enough store credit
              When the shopper pays for their pickup order with store credit
              Then the order confirmation shows no card charge
  - title: Run the ready checkout smoke cases
    variants:
      - lang: bash
        label: Maven with Cucumber-JVM (Bash)
        code: |
          mvn test -Dcucumber.filter.tags="@checkout and @smoke and not @wip"
---

I'd agree on a small set of tags, or labels, with the team. I'd use `@checkout` for the feature area and `@smoke` for a short run that checks the basics. I'd use `@wip` for unfinished cases. If a tag applies to every scenario in a feature, I'd put it on the feature. Each scenario gets that tag.

I'd use a tag expression, a rule that combines tags, to choose what runs. I'd also use it to decide where a hook, which runs setup or cleanup code, applies. I'd give each scenario its own test data so it works regardless of which others run.

### Example

In a Maven project set up to run Cucumber-JVM, I'd use the shown command to require checkout and smoke tags. I'd exclude work in progress. I'd expect the pickup order case to run and the unfinished store credit case to be skipped.
