---
title: "A 12-year-old with a travel pass rides free. Where does that case belong in the bus fare feature?"
topic: bdd
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "I'd give the pass its own scenario. I'd keep the age table for the 150-cent fare without a pass."
looksFor:
  - "Explain why two passengers of the same age can pay different fares."
  - "Use ages 5 and 12 to check the ends of the child fare range."
  - "Explain how the age column supplies a value for the age placeholder."
  - "Say what runs for each age row and for the separate pass case."
trap: "Putting every exception in one table until readers can't tell which rule each row checks."
followUps:
  - question: "The age-5 row fails and the age-12 row passes. What did Cucumber check?"
    answer: "I'd read that as two full purchase runs, one for each age. The age-5 child fare case failed. I wouldn't count either row as evidence that a pass makes the fare zero."
sources:
  - label: Cucumber, Scenario Outline and Examples
    url: https://cucumber.io/docs/gherkin/reference/#scenario-outline
examples:
  - title: Standard child fare and a separate pass rule
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Bus ticket pricing
            Scenario Outline: A child without a pass pays 150 cents
              Given a passenger aged <age> without a pass
              When the passenger buys a standard bus ticket
              Then the passenger pays 150 cents

              Examples:
                | age |
                | 5   |
                | 12  |

            Scenario: A current travel pass covers the ticket
              Given a passenger aged 12 with a valid travel pass
              When the passenger buys a standard bus ticket
              Then the passenger pays 0 cents
---

I'd give the pass its own named scenario because it changes what a passenger aged 12 pays. That makes the rule easy to find. If holiday discounts or free transfers are separate rules, I'd give them their own scenarios too.

For the 150-cent fare, I'd use a scenario outline, a template Cucumber can run with different values. I'd put the two ages at the ends of the range in an Examples table. Cucumber fills the `<age>` placeholder from that column. It runs every step once at 5 and once at 12. I expect the same fare both times because neither passenger has a pass.

### Example

I'd test ages 5 and 12 for the rule that children aged 5 through 12 without a pass pay 150 cents. In a separate run, I'd check that a rider with a current pass pays nothing.
