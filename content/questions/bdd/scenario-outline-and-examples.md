---
title: A 12-year-old with a travel pass pays nothing. Where does that case belong in the bus fare feature?
topic: bdd
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: Give the pass its own scenario and keep the age table for the 150-cent fare without a pass.
looksFor:
  - Identifies why the passenger with a pass pays a different fare at the same age.
  - Uses 5 and 12 to show the two endpoints of the same child fare.
  - Explains how the age column supplies the placeholder.
  - Describes what runs for each age row and for the stand-alone pass case.
trap: Putting every exception into one big table until the rule each row proves disappears.
followUps:
  - question: The age-5 row fails and the age-12 row passes. What has Cucumber actually checked?
    answer: It ran the full purchase scenario independently for each age. The failure is in the age-5 child fare case; neither row checks that a valid pass makes the fare zero.
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

The pass gets a named scenario because it changes what a passenger aged 12 owes. A reader
should be able to find that rule directly. I'd give holiday discounts or free transfers
their own scenarios if those are separate rules too.

For the 150-cent fare, I'd put the two boundary ages in an Examples table. Cucumber fills
`<age>` from that column and runs all the steps once at 5 and once at 12. Both runs have
the same fare and the same condition: the passenger has no pass.

### Example

Children aged 5 through 12 without a pass pay 150 cents in the example, so the outline
runs twice, once at each endpoint. A current travel pass pays nothing, and gets its own
named scenario.
