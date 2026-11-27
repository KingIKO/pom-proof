---
problem: scenario/refund-after-timeout
---

## What is going on

A timeout can occur after the payment provider has already moved the money. The app must handle a retry without making another refund. While a refund is unresolved, its share of the balance must stay reserved, meaning set aside so another refund cannot use it.

## The answer

1. Ask how the service tracks a refund and releases its reservation.

   Ask what identifies the same refund across retries. If the provider refuses it, ask which confirmed event releases the reservation.

   **Why:** The identity tells you which calls must share one financial outcome. Until the release event, your expected balance must include the reservation.

2. Spend nine minutes on a lost reply followed by a retry and six minutes on a refund larger than the unreserved balance.

   Let the provider record a partial refund. Simulate losing its reply and retry the same operation. While a refund is pending, request a separate refund larger than the unreserved balance. That balance is what remains after pending refunds are set aside.

   **Why:** The lost reply exposes a retry that pays out twice. The separate request catches a pending reservation being counted as available money.

3. Use the API to compare the sandbox provider record, the application operation, and the balance.

   The sandbox is the provider's test system, which moves no real money.

   **Why:** A dashboard status or a stubbed response, a fake reply that stands in for the provider, can show how the app interprets a call. Neither proves what the sandbox provider recorded.

4. Unit-test the pure balance rule at exactly the unreserved amount and one cent above it.

   **Why:** The rule is pure: it takes the balance and reservation amounts as its inputs. These rows expose an incorrect comparison without relying on provider timing. The check in staging, the pre-release test environment, separately proves that the rule sees a real pending reservation.

5. If one operation produces two refunds at the provider, stop the rollout.

   **Why:** Two financial effects exist even if the app shows only one entry.

6. Reproduce a successful refund whose reply arrives after the app's time limit.

   Create a settled sandbox charge and record its amount and available balance. Submit one refund. Hold the provider's successful reply until the app times out. Retry through the app with the original operation ID. Reconcile the provider's refund IDs, the application record, and the balance by checking that they agree.

   **Why:** You establish the baseline before the fault. That lets you account for every later change. Keeping the original ID makes this a retry of the same operation.

## Why the tempting answer fails

The button's internal name cannot settle when a reservation is released. Comparing email wording leaves the overspend case uncovered. A UI status cannot establish both money records. An API check is a slower, less isolated way to test the pure amount comparison.

## What the interviewer listens for

Describe what each side, the app and the provider, recorded after the timeout. Also explain how you know the retry moved money at most once.

## Sources

- [Stripe's documentation on idempotent requests](https://docs.stripe.com/api/idempotent_requests)
