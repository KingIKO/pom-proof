---
title: The repair ledger shows one deposit after a timeout. How would you check that the customer wasn't charged twice?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: I'd match the ledger entry to the payment provider's record. I'd check that a retry can't charge the customer again for the same payment.
looksFor:
  - Compare charges at the provider with entries in the service's own payment records.
  - Treat a timeout as an unknown result unless you know the payment failed.
  - Check amounts and currencies separately from how the services work together and handle lost replies.
  - Compare live records without creating test charges.
trap: Marking a payment as failed when its outcome is unknown and starting another charge with a new key.
followUps:
  - question: Your records show every payment succeeded, but the provider totals differ. What would you check?
    answer: I'd match records by payment reference, currency, and amount before deductions. I'd account for refunds and fees separately. I'd flag any record I couldn't match.
sources:
  - label: Stripe idempotent requests
    url: https://docs.stripe.com/api/idempotent_requests
  - label: Stripe testing and simulated payments
    url: https://docs.stripe.com/testing
  - label: Stripe currency amount units
    url: https://docs.stripe.com/currencies
  - label: Stripe balance reconciliation
    url: https://docs.stripe.com/reports/balance
---

I'd compare the provider's records with the ledger, the service's own record of payments. One ledger entry doesn't tell me how many times the provider moved money. I'd test that a lost reply leaves the deposit pending. I'd check that retries follow the provider's idempotency rules, which tell me how to repeat a request without repeating its effect.

I'd check the amount and status after each payment step. Authorization approves the payment, and capture collects it. A refund returns money to the customer.

I'd test rounding and currency units locally with known inputs. I'd use a stub, a stand-in for the provider, that accepts the request and drops the reply at the point I choose. I'd use the provider's sandbox, its test environment, to check that the real service accepts the request format and behaves as documented. In production, I'd reconcile by comparing records without changing them. I'd never create a live charge just to check a release.

### Example

I'd have the stub accept a $64.39 repair deposit without replying. I'd expect the service to record the deposit as pending. If the provider allows a retry, I'd expect the same logical request with the original idempotency key, which identifies requests for the same payment. I'd expect one captured deposit and one entry for 6,439 cents with the same provider reference.
