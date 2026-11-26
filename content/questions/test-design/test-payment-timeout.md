---
title: How would you test checkout when the customer loses the payment response?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Use test payments to distinguish a decline from an unknown outcome, then check that recovery reconciles the original attempt without duplicate charges.
looksFor:
  - Compares approval and decline before testing an ambiguous timeout.
  - Separates the payment provider's outcome from what the browser displays.
  - Checks that a retry or resumed session resolves the same checkout attempt.
  - Reconciles order state and total with the provider's payment record.
trap: Assuming that a timeout means no charge happened, or counting only what appears on the receipt page.
followUps:
  - question: How would you cover a known decline without using a real card?
    answer: I'd use the provider's test environment. For example, Stripe documents test payment methods that simulate issuer declines without moving money.
  - question: What if you cannot interrupt a provider response in its sandbox?
    answer: I'd use a controlled provider stub for that timing case and keep a real sandbox check for integration behavior. I'd report which paths each one proved.
sources:
  - label: Stripe testing environments and simulated declines
    url: https://docs.stripe.com/testing
---

I'd first run a successful test payment and a known decline so I can tell what each looks like in the order and at the provider. A lost response is different. The browser may have no answer even though the payment went through, so I'd test a timeout before the provider accepts the payment and another after it does.

I'd ask what the customer is supposed to do in each case and use that recovery flow. I'd check the provider's records, the order status, and the amount and currency. If the first charge went through, resolving the attempt should leave one charge and one paid order for that purchase.

### Example

A parts supplier's checkout tells the customer to return to their order while a payment is being confirmed. I'd let the provider record a successful test charge, drop the response to the browser, then reopen the order. The order should show as paid for the original total once confirmation is complete, with a single charge in the provider's records.
