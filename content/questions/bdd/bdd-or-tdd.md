---
title: "How would you use BDD and TDD to add a train fare cap?"
topic: bdd
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd agree on a fare example with the team. I'd use small failing tests to build the code that makes the example work."
looksFor:
  - "Use BDD to agree across roles on behavior a rider can observe."
  - "Explain the failing test, passing test, and code cleanup in TDD."
  - "Use one agreed scenario to choose several focused unit checks."
  - "Keep a check that shows the pieces work together."
trap: "Writing a scenario after the code is ready and missing the chance to agree on the rule first."
followUps:
  - question: "What can the scenario catch if the unit checks pass?"
    answer: "I'd use the scenario to check that the right fare goes on the right card on the right service day."
sources:
  - label: Cucumber, behavior-driven development
    url: https://cucumber.io/docs/bdd/
  - label: Cucumber, Gherkin steps
    url: https://cucumber.io/docs/gherkin/reference/#steps
  - label: Agile Alliance, test-driven development
    url: https://agilealliance.org/glossary/tdd/
examples:
  - title: Charge only the rest of the daily allowance
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Daily train fare cap
            Scenario: The next ride would go over the daily cap
              Given a rider has paid 9 dollars in fares today
              And the daily fare cap is 10 dollars
              When the rider takes a 3-dollar trip today
              Then the card is charged 1 dollar for the trip
---

I'd start with behavior-driven development (BDD), where people use examples to agree on what the system should do. I'd discuss the fares with product, development, and QA. We might agree that the ride that reaches the cap costs only the amount left before the cap. I'd write that rule as a scenario we can run against the payment flow.

I'd use test-driven development (TDD) to build the fare code in small steps. I'd write a failing unit test that checks one piece of code. Then I'd make the smallest change that passes it and clean up the code while the tests still pass. I'd repeat that for a fare that reaches the cap exactly and a fare above the remaining allowance. I'd also check a rider who's already reached the cap.

### Example

I'd follow one rider's card through one service day. If the card has paid $9 toward a $10 cap, a $3 ride should add only $1. I'd check that the daily total is $10.
