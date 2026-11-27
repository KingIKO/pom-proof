---
title: How would you run just the ready checkout smoke scenarios in Cucumber?
topic: bdd
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Tag scenarios with their purpose or area, then filter the run with a tag expression.
looksFor:
  - Tags a scenario and describes feature-level inheritance.
  - Uses a boolean expression to select and exclude scenarios.
  - Explains how tags can scope hooks.
  - Keeps tags independent of execution order.
trap: Tagging scenarios as first and second because one relies on the other's data.
followUps:
  - question: How would you scope a browser setup hook without putting that detail in each scenario?
    answer: Apply a browser tag where it belongs and give the hook a matching tag expression.
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

I'd agree on a small tag set with the team. I'd use `@checkout` for the area, `@smoke` for
the short confidence run, and `@wip` for unfinished scenarios. A feature's tags are inherited
by its scenarios, so we can put a tag there if it applies to all of them.

Cucumber can use a tag expression to select a run or to scope a hook. Tags describe when a
case or hook applies. Each scenario should set up its own data so the filtered run works
regardless of which other scenarios run.

### Example

In a Maven project already configured to run these features with Cucumber-JVM, the command
requires checkout and smoke, and excludes work in progress. It runs the pickup order case
and skips the unfinished store credit case.
