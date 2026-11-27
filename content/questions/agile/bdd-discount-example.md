---
title: "A shopper switches from pickup to delivery. How would you settle what happens to their discount?"
topic: agile
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd work out the new cart total with the team. Then we'd have an example to build and test."
looksFor:
  - "Bring an order with real numbers to the team before anyone builds the change."
  - "Ask whether the discount applies only to pickup."
  - "Check the amount due and what the shopper sees."
  - "Write the example so someone can read it without knowing how to write the test."
trap: "Checking the delivery fee but leaving the pickup discount on the order."
followUps:
  - question: "What if the shopper switches back to pickup?"
    answer: "I'd write a separate example. We'd agree whether the cart restores the offer or asks the shopper to select it again."
  - question: "Where would you check that the actual charge matches the new total?"
    answer: "I'd run a separate order submission check in a sandbox, a test environment that doesn't charge real money. I'd compare the checkout total with the payment amount."
sources:
  - label: Cucumber documentation on discovery and examples
    url: https://cucumber.io/docs/bdd/
  - label: Cucumber Gherkin reference on steps
    url: https://cucumber.io/docs/gherkin/reference/#steps
---

I'd show the product and engineering teams both possible totals. A $30 item with a $4 pickup discount starts at $26. Delivery costs $6. If the discount stays, the total is $32. If the discount goes away, the total is $36.

Once we agree on the rule, I'd write down the starting total. I'd record the switch to delivery and the price the shopper sees. We'd use the example in review. I could automate it with Cucumber, a tool that runs written scenarios, or check the price with an existing service test.

### Example

We agreed with the product team on $36 before tax. I'd show why the total changed so the shopper wouldn't think we raised the item's price.

```gherkin
Feature: Pickup discounts apply only to pickup orders
  Scenario: A shopper changes a discounted pickup order to delivery
    Given a $30 item in a pickup cart with a $4 discount
    And delivery for the item costs $6
    When the shopper changes the order to delivery
    Then the cart shows $36 before tax
    And the cart explains that the discount applies only to pickup
```
