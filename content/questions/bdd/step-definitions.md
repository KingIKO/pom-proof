---
title: Seven helmets were in stock. Which Java call does the four-helmet reservation step make?
topic: bdd
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Pass 4 to the stock model through one matching step definition and check that 3 helmets remain.
looksFor:
  - Traces the reservation from the feature text to the stock call.
  - Explains why the stock model owns the update and the step checks its result.
  - Shows where the integer argument comes from.
  - Resolves overlapping expressions without relying on the Gherkin keywords.
trap: Registering separate definitions for the same wording and expecting Cucumber to choose by keyword.
followUps:
  - question: A second feature adds a definition that matches only "the group reserves 4 helmets." Which definition should survive?
    answer: >-
      If it reserves stock the same way, I'd delete the literal definition and reuse the integer
      expression. If it means something different, I'd name that action so the expressions don't
      match the same step.
sources:
  - label: Cucumber step definitions
    url: https://cucumber.io/docs/cucumber/step-definitions/
  - label: Cucumber Expressions parameter types
    url: https://cucumber.io/docs/cucumber/cucumber-expressions/
  - label: Cucumber, ambiguous step matches
    url: https://cucumber.io/docs/cucumber/api/#ambiguous
  - label: JUnit 5 Assertions
    url: https://docs.junit.org/5.14.5/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html
examples:
  - title: Reserve helmets with a rental
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Helmets for group bike rentals
            Scenario: Four riders reserve helmets
              Given 7 helmets are available at the rental desk
              When the group reserves 4 helmets
              Then 3 helmets remain available
  - title: Convert helmet counts and call the rental stock
    variants:
      - lang: java
        label: Cucumber-JVM (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import io.cucumber.java.en.Given;
          import io.cucumber.java.en.Then;
          import io.cucumber.java.en.When;

          public class HelmetSteps {
            private HelmetStock stock;

            @Given("{int} helmets are available at the rental desk")
            public void setStock(int count) {
              stock = new HelmetStock(count);
            }

            @When("the group reserves {int} helmets")
            public void reserve(int count) {
              stock.reserve(count);
            }

            @Then("{int} helmets remain available")
            public void checkAvailable(int expected) {
              assertEquals(expected, stock.available());
            }
          }

          final class HelmetStock {
            private int available;

            HelmetStock(int available) {
              this.available = available;
            }

            void reserve(int count) {
              if (count <= 0 || count > available) {
                throw new IllegalArgumentException("Count is outside available stock");
              }
              available -= count;
            }

            int available() {
              return available;
            }
          }
---

The reservation step ends at `stock.reserve(4)`. I want the stock model to own the stock
change so the last step can check the actual count. In a real check, the Java step could
make that call through an API client or a page object.

Cucumber reaches that call by matching the step text to the expression on the Java method.
`{int}` supplies 4 as an integer. I can reuse the expression across features, but if I
register a second matching expression, Cucumber reports ambiguity. Changing the Gherkin
keyword won't resolve it.

### Example

The Java steps call a small rental stock model. Cucumber passes 4 into the reservation method,
and the final step checks that the number available fell from 7 to 3.
