---
title: What would you check if checkout never gets a payment reply?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: I'd use test payments to tell a decline from an unknown result. I'd check that recovery resolves the original attempt without charging twice.
looksFor:
  - Compare a successful payment and a decline before testing a missing reply.
  - Check what the provider recorded separately from what the browser shows.
  - Check that trying again or returning to checkout resolves the same attempt.
  - Match the order's status and total to the provider's payment record.
trap: Assuming a missing reply means there was no charge, or only checking the receipt.
followUps:
  - question: How would you test a clear decline without a real card?
    answer: I'd use the provider's test environment. For example, I'd use one of Stripe's documented test payment methods to mimic a card issuer's decline without moving money.
  - question: What would you do if the provider's test environment can't interrupt a reply?
    answer: I'd use a stub, a stand-in for the provider, so I can control when the reply drops. I'd keep a test in the provider's sandbox to check how it works with checkout. I'd report what each test proved.
sources:
  - label: Stripe testing environments and simulated declines
    url: https://docs.stripe.com/testing
---

I'd first run a successful test payment and a known decline. I'd check what each looks like in the order and in the provider's records. The browser may get no reply even if the payment goes through. I'd test a timeout, when the browser gives up waiting, before the provider accepts the payment. I'd test another after the provider accepts it.

I'd ask what the customer should do in each case. I'd follow those recovery steps and compare the order status with the provider's records. I'd check that the amount and currency agree. If the first charge went through, I'd expect one charge and one paid order once the attempt is resolved.

### Example

In a parts supplier's checkout, I'd follow the instruction to return to the order while payment is pending. I'd let the provider record a successful test charge but drop its reply to the browser. I'd reopen the order. Once payment is confirmed, I'd expect it to show as paid for the original total. I'd expect the provider to show only one charge.
