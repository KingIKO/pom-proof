---
title: How would BDD and TDD work together when adding a train fare cap?
topic: bdd
roles: [automation, sdet]
level: mid
type: concept
oneLine: Agree on a fare example with the team, then use small failing tests to build the pieces that make it pass.
looksFor:
  - Uses BDD to settle an observable rule across roles.
  - Explains red, green, and refactor in TDD.
  - Derives several focused unit checks from one agreed scenario.
  - Retains evidence that the parts work together.
trap: Writing a scenario after implementation and missing the decision it could have prompted.
followUps:
  - question: If the unit checks pass, what does the scenario still buy you?
    answer: It can catch the right fare calculation being applied to the wrong card or the wrong service day.
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

I'd start BDD by working through fares with product, development and QA. We could agree that
the trip which reaches the cap still costs the remaining amount. I'd write that agreed
behavior as a scenario that we can run against the payment flow.

For TDD I'd work on the fare code in smaller steps. I'd write a failing unit test, make the
smallest change that gets it passing, then refactor while the tests stay green. I'd repeat
that loop for the exact cap, the remaining allowance below the next fare, and the case where
the rider has already reached the cap.

### Example

The shared scenario follows one rider's card on one service day. The card has already paid
$9 and the cap is $10. A $3 ride should add only $1, so the daily total stays at $10.
