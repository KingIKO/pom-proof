---
title: Payment times out on the last item in stock. What would you check before the shopper pays again?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Before asking the shopper to pay again, I'd check whether the $42 payment already bought the last unit.
looksFor:
  - Find the same attempt in the payment provider's records and in order and stock records.
  - Explain when the store should hold the last item and when it should release it.
  - Calculate the $42 total without using the checkout result.
  - Check that a retry leaves one charge and one paid order.
trap: Checking the confirmation screen alone while the charge or stock reservation is still wrong.
followUps:
  - question: The provider confirms $42, but another cart can reserve the last unit. What would you check?
    answer: I'd find which order holds the unit and when the first hold changed. I'd use two test carts to see if the hold can expire before the order records the charge.
---

Before testing the retry button, I'd find the payment that matches the order. If the payment provider already took $42, I'd expect one paid order and one unit sold. I'd calculate the expected total from the discount and tax rules. I'd include how the service rounds the amount. I'd check that a second cart can't buy the unit while the first payment is still going through.

If the outcome is unknown, I'd ask which payment methods might still go through. I'd also ask when the shop considers the purchase abandoned. If the payment is declined or the cart expires, I'd expect the item hold to end according to the shop's rules. I'd work through these cases before checking the layout.

### Example

I'd use a $50 item with a $10 discount and 5 percent tax on the discounted amount. I'd expect a $42 charge. In the payment sandbox, the provider's test environment, I'd have the gateway accept the amount without checkout receiving the reply. After retrying the same purchase, I'd expect one paid order and one charge of $42. I'd check that stock went down by one unit.
