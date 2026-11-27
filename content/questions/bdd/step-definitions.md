---
title: "Seven helmets are in stock. Which Java call reserves four of them?"
topic: bdd
roles: [automation, sdet]
level: junior
type: tooling
oneLine: "I'd pass 4 to the stock model through one matching step definition. I'd then check that 3 helmets remain."
looksFor:
  - "Trace the words in the reservation step to the call that changes stock."
  - "Explain why the stock model changes the count and the step checks it."
  - "Show where the whole number passed to Java comes from."
  - "Fix overlapping matches without relying on Gherkin keywords to tell the steps apart."
trap: "Giving Cucumber two definitions for the same words and expecting the step keyword to resolve the match."
followUps:
  - question: "Another feature adds a match only for “the group reserves 4 helmets.” Which definition would you keep?"
    answer: "If both reserve stock the same way, I'd delete the exact-text match and reuse the expression that accepts a whole number. If they mean different things, I'd change the wording so only one expression matches each action."
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

I'd use the call `stock.reserve(4)` to reserve the helmets. I'd let the stock model update the count so the last step can check the actual result. In a real check, my Java step might make the call through an API client or a page object that handles screen actions.

Cucumber uses a step definition, a method it calls when the scenario's text matches the method's expression. The `{int}` placeholder passes 4 as a whole number. I'd reuse the expression across features when the action is the same. If I add another expression that matches the same words, Cucumber reports more than one match.

Gherkin keywords are the words that start each step, like Given and When. Cucumber ignores them when it matches step text.

### Example

I'd use the Java steps with a small rental stock model. After Cucumber passes 4 to the reservation method, I'd check that the available count dropped from 7 to 3.
