---
problem: scenario/refund-after-timeout
---

## What is going on

A timeout can occur after the provider moved money. The app must handle a retry without another refund, and an unresolved refund must keep its share of the balance reserved.

## The answer

1. Ask what identifies the same refund across retries and which confirmed event releases the reservation if the provider refuses it.

   **Why:** The identity tells you which calls must share one financial outcome. Until the release event, the reservation belongs in your expected balance.

2. Spend nine minutes losing the reply after the provider records a partial refund, then retrying. Spend six asking for a separate amount above the unreserved balance while a refund is pending.

   **Why:** The first check detects a retry that pays out twice. The second detects a pending reservation being counted as available money.

3. Use the API to compare the sandbox provider record, application operation, and balance.

   **Why:** A dashboard status or a stubbed response can show how the app interprets a call without proving what the sandbox provider recorded.

4. Unit-test the pure balance rule at exactly the unreserved amount and one cent above it.

   **Why:** These rows expose an incorrect comparison without relying on provider timing. The staging check separately proves the rule sees a real pending reservation.

5. Stop rollout if one operation produces two refunds at the provider.

   **Why:** Two financial effects exist even if the app shows only one entry.

6. Seed a settled sandbox charge and record its amount and available balance. Submit one refund and hold the successful provider reply through timeout. Retry through the app with the original operation ID, then reconcile provider refund IDs, the application record, and the balance.

   **Why:** Establishing the baseline before the fault lets you account for every later change. Keeping the original ID makes this a retry of the same operation.

## Why the tempting answer fails

The internal button name cannot resolve reservation release. Email wording leaves the overspend case uncovered. UI status cannot establish both money records, and an API check is a slower, less isolated way to test the pure amount comparison.

## What the interviewer listens for

Describe what was recorded after timeout on both sides, and how you know the retry moved money at most once.

## Sources

- [Stripe's documentation on idempotent requests](https://docs.stripe.com/api/idempotent_requests)
