---
problem: scenario/refund-after-timeout
---

First ask what ties a retry to the original refund and when the reservation is released if a pending refund fails. Keep the reservation in the expected balance until the confirmed event. Decide which IDs and amounts to capture from each system before introducing the timeout.

Spend nine minutes on the lost reply and six on a second amount that exceeds the unreserved balance. Seed a settled charge, submit through the app, hold the successful provider reply through timeout, and retry with the original operation ID. After reconciliation, compare the provider's refund records with the application record and expected remaining balance. A stub answering success can check how the app makes a call, but it cannot prove what the provider recorded in the sandbox.

Start at the API for the retry because the two money records matter more than the dashboard status. Put the pure balance rule in a unit table, including an amount equal to the unreserved balance and one cent over. Follow it with the staging check against a real pending refund. The decoy's email check overlooks the uncertain balance. Duplicate monetary effects stop release.

An interviewer wants to know what happened after the timeout, not just that retries are enabled. See [Stripe's documentation on idempotent requests](https://docs.stripe.com/api/idempotent_requests) for a concrete provider model.
