---
title: A shopper sees a payment timeout on the last item. What would you check before they try again?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Find out whether the $42 attempt already bought the last unit before asking the shopper to pay again.
looksFor:
  - Looks up the same attempt in the provider, order and stock records.
  - Explains when the last unit should stay held and when it should be released.
  - Works out the $42 total independently of checkout.
  - Checks that repeating the purchase leaves one charge and one paid order.
trap: Checking the confirmation screen while a charge or reserved item remains in the wrong state.
followUps:
  - question: The provider confirms $42 but a second cart can reserve the last unit. What would you check?
    answer: I'd look up which order owns the unit and when the first hold changed. I'd use two test carts to see if the hold can expire before the successful charge is reflected in the order.
---

I'd look for the payment that matches the order before testing the retry button. If the provider
already took $42, that attempt should end with one paid order and one unit sold. I'd check the
total against the discount and tax rules, including how rounding is handled, and make sure the
unit never becomes sellable to a second cart while the first purchase is being settled.

If there is no confirmed result, I'd ask which payment methods can still settle and when the
shop considers the purchase abandoned. A confirmed decline and an expired cart should release
the hold according to the shop's rules. I'd settle those cases before spending time on layout.

### Example

Say a $50 item has a $10 discount and 5 percent tax on the discounted amount. I'd expect a $42
charge. In the payment sandbox I'd arrange for the gateway to accept that amount but for checkout
to miss the reply. Retrying the same purchase should leave one paid order, one charge of $42 and
one unit deducted.
