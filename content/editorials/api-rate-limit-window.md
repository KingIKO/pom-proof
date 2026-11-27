---
problem: scenario/api-rate-limit-window
---

## What is going on

A fixed-window write quota counts each tenant's writes and resets the count at set times. A tenant is one customer account with its own data. The quota has to count the right tenant and the right operation.

HTTP 429 is the status code for too many requests. This product also requires a documented `Retry-After` value on HTTP 429. That header tells the client how long to wait before it tries again. The HTTP specification itself makes the header optional for 429.

## The answer

1. Ask which operations share a counter, what identifies a tenant, exactly when the window resets, and what `Retry-After` should report.

   **Why:** You need to know which requests add to the same counter. You also need to know when that counter starts fresh. Until you know both, you cannot predict which request the service should reject.

2. Spend six minutes on recovery for one tenant and five minutes on isolation, meaning each tenant keeps its own counter.

   Use up one tenant's quota, then check the rejected write, retry time, and reset. While the first tenant is blocked, check that a second tenant can still write.

   **Why:** The first check catches a quota that fails to deny or recover at the boundary. A shared counter could wrongly block a second tenant whose own quota has room.

3. Use the API to check that the deployed service rejects the extra write and then recovers.

   **Why:** The response shows what the service decided. Together with the stored records, it shows whether the deployed write path follows that decision.

4. Use the API to check isolation between the fixture tenants, the test tenants set up for this check.

   **Why:** A unit test checks one piece of code on its own. It can confirm that the code builds the counter key, the value that names a request's counter, correctly. The deployed service can still call that code with the wrong tenant identity.

5. If a request returns 429 and still creates a record, stop the rollout to users.

   **Why:** The response makes the quota look enforced. The write still happened, so the quota failed to prevent it.

6. Reproduce the quota limit and recovery with the clock under test control.

   In staging, the pre-release test environment, freeze the clock and create a fresh tenant. Make exactly the allowed writes. Check that the next write gets 429 and creates no record. Then move the clock to the reset and confirm that a write succeeds.

   **Why:** A frozen clock keeps the setup writes and the rejected write in the same window. You move the clock only after the rejection. That way, the reset is the only reason the next write can succeed.

## Why the tempting answer fails

The help center heading cannot tell you how the service counts operations. One write from each tenant under quota would pass even if the tenants shared a counter. A unit check of isolation would miss a mix-up of tenant identity in the deployed service.

## What the interviewer listens for

Name what you check in storage after a rejected response. Compare the two tenants while the first tenant is still blocked.

## Sources

- [RFC 6585, HTTP 429](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [MDN's 429 reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429)
