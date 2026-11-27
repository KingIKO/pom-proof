---
problem: scenario/api-rate-limit-window
---

## What is going on

A fixed-window write quota has to act on the right tenant and operation. This product also requires a documented `Retry-After` value on HTTP 429. The HTTP specification itself makes that header optional for 429.

## The answer

1. Ask which operations share a counter, what identifies a tenant, exactly when the window resets, and what `Retry-After` should report.

   **Why:** Until you know which requests increment the same counter and when it becomes fresh, you cannot predict which request should be rejected.

2. Spend six minutes exhausting one tenant's quota and checking denial, the retry time, and reset. Spend five minutes checking that a second tenant can write while the first is still exhausted.

   **Why:** The first check catches a quota that fails to deny or recover at the boundary. The second creates the one condition under which a shared counter would wrongly deny a tenant that has room.

3. Use the API to check the deployed service's denial and subsequent recovery.

   **Why:** The response and stored records together show whether the deployed write path honors the decision.

4. Use the API to check isolation between the fixture tenants.

   **Why:** A unit test can validate counter-key construction while the deployed service still calls it with the wrong identity.

5. Stop rollout if a request returns 429 and still creates a record.

   **Why:** The quota has failed to prevent the write, even though the response makes it look enforced.

6. Fix the staging clock and create a fresh tenant, make exactly the allowed writes, check 429 and no new record on the next write, then advance to reset and verify a successful write.

   **Why:** Freezing the clock keeps setup and denial in the same window. Moving it only afterward isolates reset as the reason the next write succeeds.

## Why the tempting answer fails

The help center heading cannot tell you how operations are counted. Writing once from each tenant under quota would pass even if they shared a counter. A unit isolation check would miss a deployed identity mix-up.

## What the interviewer listens for

Name what you check in storage after a denied response. Make the tenant comparison while the first tenant is still blocked.

## Sources

- [RFC 6585, HTTP 429](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [MDN's 429 reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429)
