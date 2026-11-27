---
title: A shopper switches from pickup to delivery. How would you settle what happens to their discount?
topic: agile
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Work through the cart total after a fulfillment change so the team has an example it can build and verify.
looksFor:
  - Brings a concrete order to the conversation before implementation.
  - Surfaces what the team means by a pickup-only discount.
  - Checks both the amount due and what the shopper sees.
  - Keeps the example readable for someone who doesn't write the test.
trap: Confirming the new delivery fee while leaving the old pickup discount on the order.
followUps:
  - question: What if the shopper switches back to pickup?
    answer: I'd give that a separate example and agree whether the cart reapplies the offer or asks the shopper to select it again.
  - question: Where would you check that the amount actually charged matches the new total?
    answer: In a separate order submission check, I'd compare the checkout total with the payment amount in a sandbox.
sources:
  - label: Cucumber documentation on discovery and examples
    url: https://cucumber.io/docs/bdd/
  - label: Cucumber Gherkin reference on steps
    url: https://cucumber.io/docs/gherkin/reference/#steps
---

I'd put the two totals in front of product and engineering. The cart has a $30 item and a $4
pickup discount, so it starts at $26. Delivery costs $6. Should the new total be $32 or $36?
The difference tells us whether the discount belongs to the cart or to the pickup choice.

Once we agree, I'd write down the example with the starting total, the switch to delivery
and the price the shopper sees. We can use that example in review whether we automate it
with Cucumber or check the price through an existing service test.

### Example

Product chose $36 before tax. We also agreed to show why the amount changed so it doesn't look
like the site raised the item's price.

```gherkin
Feature: Pickup discounts apply only to pickup orders
  Scenario: A shopper changes a discounted pickup order to delivery
    Given a $30 item in a pickup cart with a $4 discount
    And delivery for the item costs $6
    When the shopper changes the order to delivery
    Then the cart shows $36 before tax
    And the cart explains that the discount applies only to pickup
```
