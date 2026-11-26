---
problem: scenario/last-pickup-slot
---

Stop rollout if both orders are confirmed. The store cannot fulfill both pickups, and each customer already has an order number.

Spend four minutes on the two-customer check and two on cancellation. Use separate Playwright browser contexts so cookies and cart state stay independent. Prepare both checkouts with one slot remaining, submit together, then assert one confirmation, one rejection, and one reservation in the test store.

For cancellation, assert that the next valid booking succeeds after the original order is canceled. Checking only that the hours display misses the service behavior changed by this release.
