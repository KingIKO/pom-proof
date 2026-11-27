---
title: The repair ledger shows one deposit after a timeout. What evidence would rule out a second charge?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Match the ledger entry to the provider's record, then prove the retry cannot create a second charge for the same intent.
looksFor:
  - Looks for charges at the provider as well as entries in the ledger.
  - Keeps an uncertain timeout distinct from a definite failure.
  - Separates amount and currency checks from the integration and lost-reply tests.
  - Checks live reconciliation without issuing test charges.
trap: Marking an uncertain payment failed and starting a new charge with a new key.
followUps:
  - question: What if all the internal payments show success but the provider totals disagree?
    answer: I'd match provider records to ledger entries by reference, currency, and gross amount, then account for refunds and fees separately and flag unmatched records for review.
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

I'd compare the provider records with the ledger. One internal entry doesn't tell me how
many times the provider moved money. I'd test how a lost reply leaves the deposit pending,
then confirm that any retry follows the provider's idempotency rules. Authorization, capture,
and refund should each leave the expected amount and state.

I'd test rounding and currency units locally with explicit inputs. A stub can accept a
request and drop the reply at the exact point I need. The provider sandbox tells me whether
the real integration accepts the request format and behaves as documented. For production,
I'd reconcile read-only and never create a live charge just to check the release.

### Example

The provider accepts a $64.39 repair deposit, but the stub simulates a lost reply. The service
should record a pending outcome and retry the same logical request with the original
idempotency key where the provider contract permits. I'd expect one captured deposit and
one internal ledger entry for 6,439 cents with the same provider reference.
